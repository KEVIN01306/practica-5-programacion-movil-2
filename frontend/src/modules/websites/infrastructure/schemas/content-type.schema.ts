import { z } from 'zod';

export const contentTypeSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters'),
    slug: z
        .string()
        .trim()
        .min(2, 'Slug must be at least 2 characters')
        .max(100, 'Slug must not exceed 100 characters')
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            'Slug must contain only lowercase letters, numbers, and hyphens (e.g., blog-posts)'
        ),
    description: z
        .string()
        .trim()
        .max(500, 'Description must not exceed 500 characters')
        .optional()
        .or(z.literal('')),
});

export type ContentTypeFormData = z.infer<typeof contentTypeSchema>;
