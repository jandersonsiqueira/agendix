-- Agendix: identidades independentes, estabelecimentos e vínculos seguros.
create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null default '',
    created_at timestamptz not null default now()
);

create table public.organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(btrim(name)) between 2 and 100),
    slug text not null unique,
    created_at timestamptz not null default now()
);

create type public.organization_role as enum ('owner', 'admin', 'receptionist', 'professional');

create table public.organization_members (
    organization_id uuid not null references public.organizations(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role public.organization_role not null,
    status text not null default 'active' check (status in ('active', 'disabled')),
    created_at timestamptz not null default now(),
    primary key (organization_id, user_id)
);

create index organization_members_user_idx on public.organization_members(user_id, status);

create table public.organization_invitations (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    email text not null check (email = lower(btrim(email))),
    role public.organization_role not null check (role <> 'owner'),
    token_hash text not null unique,
    expires_at timestamptz not null default (now() + interval '7 days'),
    accepted_at timestamptz,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now()
);

create index organization_invitations_org_idx on public.organization_invitations(organization_id);

create or replace function public.create_profile_for_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    insert into public.profiles(id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
    on conflict (id) do nothing;
    return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.create_profile_for_user();

-- Helper SECURITY DEFINER evita recursão nas políticas de RLS.
create or replace function public.has_org_role(org uuid, allowed public.organization_role[])
returns boolean language sql stable security definer set search_path = '' as $$
    select exists (
        select 1 from public.organization_members m
        where m.organization_id = org and m.user_id = (select auth.uid())
          and m.status = 'active' and m.role = any(allowed)
    );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invitations enable row level security;

create policy profiles_select_self on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_self on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy organizations_select_members on public.organizations for select to authenticated
using (public.has_org_role(id, array['owner','admin','receptionist','professional']::public.organization_role[]));
create policy memberships_select on public.organization_members for select to authenticated
using (user_id = (select auth.uid()) or public.has_org_role(organization_id, array['owner','admin']::public.organization_role[]));
-- Sem INSERT/UPDATE/DELETE direto nas tabelas de empresas, vínculos ou convites.

create or replace function public.create_organization(p_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_slug text;
begin
    if auth.uid() is null then raise exception 'Não autenticado'; end if;
    if char_length(btrim(coalesce(p_name,''))) not between 2 and 100 then raise exception 'Nome inválido'; end if;
    v_slug := 'empresa-' || replace(gen_random_uuid()::text, '-', '');
    insert into public.organizations(name, slug) values (btrim(p_name), v_slug) returning id into v_id;
    insert into public.organization_members(organization_id, user_id, role)
    values (v_id, auth.uid(), 'owner');
    return v_id;
end;
$$;

create or replace function public.create_invitation(p_organization_id uuid, p_email text, p_role public.organization_role, p_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_email text;
begin
    if not public.has_org_role(p_organization_id, array['owner','admin']::public.organization_role[]) then
        raise exception 'Sem permissão';
    end if;
    if p_role = 'owner' or p_role is null or (p_role = 'admin' and not public.has_org_role(p_organization_id, array['owner']::public.organization_role[])) then
        raise exception 'Perfil não permitido';
    end if;
    v_email := lower(btrim(coalesce(p_email,'')));
    if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'E-mail inválido'; end if;
    if length(p_token) < 40 then raise exception 'Token inválido'; end if;
    if exists (select 1 from public.organization_members m join auth.users u on u.id = m.user_id
               where m.organization_id = p_organization_id and lower(u.email) = v_email and m.status = 'active') then
        raise exception 'Usuário já participa do estabelecimento';
    end if;
    insert into public.organization_invitations(organization_id, email, role, token_hash, created_by)
    values (p_organization_id, v_email, p_role, encode(extensions.digest(p_token, 'sha256'), 'hex'), auth.uid())
    returning id into v_id;
    return v_id;
end;
$$;

-- Não revela o e-mail do convidado a visitantes não autenticados.
create or replace function public.accept_invitation(p_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_inv public.organization_invitations%rowtype; v_email text;
begin
    if auth.uid() is null then raise exception 'Faça login para aceitar o convite'; end if;
    select lower(email) into v_email from auth.users where id = auth.uid() and email_confirmed_at is not null;
    if v_email is null then raise exception 'Confirme seu e-mail antes de aceitar'; end if;
    select * into v_inv from public.organization_invitations
    where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    for update;
    if not found or v_inv.accepted_at is not null or v_inv.expires_at < now() then
        raise exception 'Convite inválido ou expirado';
    end if;
    if v_email <> v_inv.email then raise exception 'Este convite pertence a outro e-mail'; end if;
    insert into public.organization_members(organization_id, user_id, role, status)
    values (v_inv.organization_id, auth.uid(), v_inv.role, 'active')
    on conflict (organization_id, user_id) do update set role = excluded.role, status = 'active';
    update public.organization_invitations set accepted_at = now() where id = v_inv.id;
    return v_inv.organization_id;
end;
$$;

create or replace function public.set_member_role(p_organization_id uuid, p_user_id uuid, p_role public.organization_role)
returns void language plpgsql security definer set search_path = '' as $$
begin
    if not public.has_org_role(p_organization_id, array['owner']::public.organization_role[]) then raise exception 'Somente proprietário'; end if;
    if p_role = 'owner' or p_role is null then raise exception 'Não é possível atribuir proprietário'; end if;
    update public.organization_members set role = p_role
    where organization_id = p_organization_id and user_id = p_user_id and role <> 'owner';
    if not found then raise exception 'Membro não encontrado'; end if;
end;
$$;

create or replace function public.remove_member(p_organization_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
    if not public.has_org_role(p_organization_id, array['owner']::public.organization_role[]) then raise exception 'Somente proprietário'; end if;
    delete from public.organization_members where organization_id = p_organization_id
      and user_id = p_user_id and role <> 'owner';
    if not found then raise exception 'Membro não encontrado'; end if;
end;
$$;

revoke all on function public.has_org_role(uuid, public.organization_role[]) from public, anon;
revoke all on function public.create_organization(text) from public, anon;
revoke all on function public.create_invitation(uuid, text, public.organization_role, text) from public, anon;
revoke all on function public.accept_invitation(text) from public, anon;
revoke all on function public.set_member_role(uuid, uuid, public.organization_role) from public, anon;
revoke all on function public.remove_member(uuid, uuid) from public, anon;
grant execute on function public.has_org_role(uuid, public.organization_role[]) to authenticated;
grant execute on function public.create_organization(text) to authenticated;
grant execute on function public.create_invitation(uuid, text, public.organization_role, text) to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
grant execute on function public.set_member_role(uuid, uuid, public.organization_role) to authenticated;
grant execute on function public.remove_member(uuid, uuid) to authenticated;

create or replace function public.list_organization_members(p_organization_id uuid)
returns table(user_id uuid, full_name text, email text, role public.organization_role, status text)
language plpgsql stable security definer set search_path = '' as $$
begin
    if not public.has_org_role(p_organization_id, array['owner','admin']::public.organization_role[]) then
        raise exception 'Sem permissão';
    end if;
    return query
        select m.user_id, p.full_name, coalesce(u.email, ''), m.role, m.status
        from public.organization_members m
        join auth.users u on u.id = m.user_id
        left join public.profiles p on p.id = m.user_id
        where m.organization_id = p_organization_id
        order by case when m.role = 'owner' then 0 else 1 end, p.full_name, u.email;
end;
$$;
revoke all on function public.list_organization_members(uuid) from public, anon;
grant execute on function public.list_organization_members(uuid) to authenticated;

-- ============================================================
-- PERMISSÕES DE ACESSO
-- ============================================================

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON TABLE
    public.profiles,
    public.organizations,
    public.organization_members
TO authenticated;