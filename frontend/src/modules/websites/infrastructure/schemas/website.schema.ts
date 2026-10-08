import { z } from 'zod';

export const WebsiteFormSchema = z.object({
    name: z
        .string({ required_error: 'Website name is required' })
        .min(1, 'Website name is required')
        .max(255, 'Name must be at most 255 characters'),
    domain: z
        .string({ required_error: 'Domain is required' })
        .min(1, 'Domain is required')
        .max(255, 'Domain must be at most 255 characters')
        .regex(
            /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|localhost(?::\d+)?$/,
            'Enter a valid domain name (e.g. company.com or sub.domain.org)'
        ),
    hostingProvider: z.string().max(255).optional().nullable(),
    hostingNotes: z.string().optional().nullable(),
    isActive: z.boolean(),
    ownerId: z.string().uuid().optional().nullable(),
});

export type WebsiteFormValues = z.infer<typeof WebsiteFormSchema>;
