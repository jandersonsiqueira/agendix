import {z} from 'zod';
export const organizationSchema = z.object({name: z.string().trim().min(2).max(100)});
export const inviteSchema = z.object({
  organizationId: z.string().uuid(),
  email: z.email().trim().toLowerCase(),
  role: z.enum(['admin','receptionist','professional']),
});
export const passwordSchema = z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.');
