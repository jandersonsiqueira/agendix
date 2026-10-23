import 'server-only';
import {redirect} from 'next/navigation';
import {createClient} from './supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  const {data: {user}, error} = await supabase.auth.getUser();
  if (error || !user) redirect('/login');
  return {supabase, user};
}

export type Organization = {id: string; name: string; slug: string; created_at: string};
export type Membership = {organization_id: string; role: 'owner'|'admin'|'receptionist'|'professional'; organization: Organization};

export async function getMemberships() {
  const {supabase, user} = await requireUser();
  const {data, error} = await supabase.from('organization_members')
    .select('organization_id, role, organization:organizations!inner(id,name,slug,created_at)')
    .eq('user_id', user.id).eq('status', 'active');
  if (error) throw new Error('Não foi possível consultar seus estabelecimentos.');
  // Supabase types without generated DB schema do not infer joined relation shape.
  return (data ?? []) as unknown as Membership[];
}
