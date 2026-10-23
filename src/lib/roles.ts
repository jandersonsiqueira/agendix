export type OrganizationRole = 'owner' | 'admin' | 'receptionist' | 'professional';

export function roleLabel(role: OrganizationRole): string {
    return {
        owner: 'Proprietário',
        admin: 'Administrador',
        receptionist: 'Recepção',
        professional: 'Profissional',
    }[role];
}
