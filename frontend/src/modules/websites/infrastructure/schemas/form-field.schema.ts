import { z } from 'zod';

export const FormFieldFormSchema = z.object({
    label: z
        .string()
        .trim()
        .min(1, 'Label is required')
        .max(100, 'Label must not exceed 100 characters'),
    key: z
        .string()
        .trim()
        .min(1, 'Key is required')
        .max(64, 'Key must not exceed 64 characters')
        .regex(
            /^[a-z0-9_]+$/,
            'Key must contain only lowercase letters, numbers, and underscores (e.g. phone_number)'
        ),
    type: z.enum(['STRING', 'TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'JSON', 'URL']),
    isRequired: z.boolean(),
});

export type FormFieldFormData = z.infer<typeof FormFieldFormSchema>;
