import { z } from 'zod';

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
        newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
        confirmPassword: z.string().min(1, 'Debe confirmar su nueva contraseña'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
