import { z } from 'zod';

export const passwordResetRequestSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
});

export type PasswordResetRequestFormValues = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetVerifySchema = z.object({
    code: z
        .string()
        .length(6, 'The verification code must be exactly 6 digits')
        .regex(/^\d{6}$/, 'The code must contain only numbers'),
});

export type PasswordResetVerifyFormValues = z.infer<typeof passwordResetVerifySchema>;

export const passwordResetNewSchema = z
    .object({
        currentPassword: z.string().optional(),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters long'),
        confirmPassword: z
            .string()
            .min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type PasswordResetNewFormValues = z.infer<typeof passwordResetNewSchema>;
