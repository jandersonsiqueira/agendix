import 'server-only';
import {cookies} from 'next/headers';
import {getMemberships} from './auth';

export const ACTIVE_ORG_COOKIE = 'agendix_active_org';

export async function getOrganizationContext() {
    const memberships = await getMemberships();
    const store = await cookies();
    const requested = store.get(ACTIVE_ORG_COOKIE)?.value;
    const current = memberships.find((item) => item.organization_id === requested) ?? memberships[0] ?? null;
    return {memberships, current};
}
