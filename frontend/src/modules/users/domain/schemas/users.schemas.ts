import { z } from 'zod';

export const ALLOWED_USER_EMAIL_DOMAINS = ['pharmadel.com', 'cadimportinc.com'] as const;

export const isValidUserEmailDomain = (email?: string | null): boolean => {
    if (!email || typeof email !== 'string') return false;
    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1];
    if (!domain) return false;
    return (ALLOWED_USER_EMAIL_DOMAINS as readonly string[]).includes(domain);
};

export const createUserSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'El correo electrónico es requerido')
        .email('Ingrese un correo electrónico válido')
        .refine(isValidUserEmailDomain, {
            message: 'Dominio inválido para este usuario. Solo se permiten correos @pharmadel.com o @cadimportinc.com.',
        }),
    passwordRaw: z
        .string()
        .min(8, 'Password must be at least 8 characters long'),
    firstName: z
        .string()
        .trim()
        .min(1, 'First name is required')
        .max(50, 'Maximum 50 characters'),
    lastName: z
        .string()
        .trim()
        .min(1, 'Last name is required')
        .max(50, 'Maximum 50 characters'),
    roles: z
        .array(z.string())
        .min(1, 'Please select at least one role for the user'),
});

export const updateUserSchema = z.object({
    email: z
        .string()
        .trim()
        .email('Ingrese un correo electrónico válido')
        .refine(
            (val) => !val || val === '' || isValidUserEmailDomain(val),
            {
                message: 'Dominio inválido para este usuario. Solo se permiten correos @pharmadel.com o @cadimportinc.com.',
            }
        )
        .optional()
        .or(z.literal('')),
    passwordRaw: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .optional()
        .or(z.literal('')),
    firstName: z
        .string()
        .trim()
        .min(1, 'First name cannot be empty')
        .max(50, 'Maximum 50 characters')
        .optional(),
    lastName: z
        .string()
        .trim()
        .min(1, 'Last name cannot be empty')
        .max(50, 'Maximum 50 characters')
        .optional(),
    roles: z
        .array(z.string())
        .min(1, 'Please select at least one role')
        .optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
