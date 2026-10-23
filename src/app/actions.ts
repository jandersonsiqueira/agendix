'use server';

import {randomBytes} from 'node:crypto';
import {cookies} from 'next/headers';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {getOrganizationContext, ACTIVE_ORG_COOKIE} from '@/lib/context';
import {requireUser} from '@/lib/auth';
import {inviteSchema, organizationSchema} from '@/lib/validation';

export type ActionState = {error?: string; success?: string; inviteUrl?: string};

export async function createOrganization(_state: ActionState, form: FormData): Promise<ActionState> {
    const parsed = organizationSchema.safeParse({name: form.get('name')});
    if (!parsed.success) return {error: 'Informe um nome de 2 a 100 caracteres.'};
    const {supabase} = await requireUser();
    const {data, error} = await supabase.rpc('create_organization', {p_name: parsed.data.name});
    if (error || !data) return {error: error?.message ?? 'Não foi possível criar o estabelecimento.'};
    const store = await cookies();
    store.set(ACTIVE_ORG_COOKIE, data, {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365});
    revalidatePath('/app', 'layout');
    redirect('/app');
}

export async function switchOrganization(form: FormData) {
    const id = String(form.get('organizationId') ?? '');
    const {memberships} = await getOrganizationContext();
    if (!memberships.some((item) => item.organization_id === id)) throw new Error('Estabelecimento não autorizado.');
    const store = await cookies();
    store.set(ACTIVE_ORG_COOKIE, id, {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365});
    revalidatePath('/app', 'layout');
    redirect('/app');
}

export async function inviteMember(_state: ActionState, form: FormData): Promise<ActionState> {
    const {current} = await getOrganizationContext();
    if (!current || !['owner', 'admin'].includes(current.role)) return {error: 'Sem permissão.'};
    const parsed = inviteSchema.safeParse({
        organizationId: current.organization_id,
        email: form.get('email'),
        role: form.get('role'),
    });
    if (!parsed.success) return {error: 'Confira o e-mail e o perfil selecionado.'};
    const token = randomBytes(32).toString('hex');
    const {supabase} = await requireUser();
    const {error} = await supabase.rpc('create_invitation', {
        p_organization_id: parsed.data.organizationId,
        p_email: parsed.data.email,
        p_role: parsed.data.role,
        p_token: token,
    });
    if (error) return {error: error.message};
    const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';
    return {success: 'Convite criado. Compartilhe o link abaixo com o profissional.', inviteUrl: `${site}/convite/${token}`};
}

export async function updateMember(form: FormData) {
    const {current} = await getOrganizationContext();
    if (!current || current.role !== 'owner') throw new Error('Sem permissão.');
    const userId = String(form.get('userId') ?? '');
    const role = String(form.get('role') ?? '');
    if (!['admin', 'receptionist', 'professional'].includes(role)) throw new Error('Perfil inválido.');
    const {supabase} = await requireUser();
    const {error} = await supabase.rpc('set_member_role', {p_organization_id: current.organization_id, p_user_id: userId, p_role: role});
    if (error) throw new Error(error.message);
    revalidatePath('/app/equipe');
}

export async function removeMember(form: FormData) {
    const {current} = await getOrganizationContext();
    if (!current || current.role !== 'owner') throw new Error('Sem permissão.');
    const {supabase} = await requireUser();
    const {error} = await supabase.rpc('remove_member', {p_organization_id: current.organization_id, p_user_id: String(form.get('userId') ?? '')});
    if (error) throw new Error(error.message);
    revalidatePath('/app/equipe');
}

export async function acceptInvitation(form: FormData) {
    const token = String(form.get('token') ?? '');
    if (!/^[a-f0-9]{64}$/.test(token)) throw new Error('Convite inválido.');
    const {supabase} = await requireUser();
    const {data, error} = await supabase.rpc('accept_invitation', {p_token: token});
    if (error || !data) throw new Error(error?.message ?? 'Não foi possível aceitar o convite.');
    const store = await cookies();
    store.set(ACTIVE_ORG_COOKIE, data, {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365});
    revalidatePath('/app', 'layout');
    redirect('/app');
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    const store = await cookies();
    store.delete(ACTIVE_ORG_COOKIE);
    redirect('/login');
}
