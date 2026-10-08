import { z } from 'zod';

export const ContactFormSchema = z.object({
    websiteId: z.string().uuid('Please select a valid website'),
    email: z.string().trim().email('Please enter a valid email address'),
    firstName: z.string().trim().max(100, 'First name must not exceed 100 characters').optional().nullable(),
    lastName: z.string().trim().max(100, 'Last name must not exceed 100 characters').optional().nullable(),
    phone: z.string().trim().max(50, 'Phone must not exceed 50 characters').optional().nullable(),
    company: z.string().trim().max(150, 'Company must not exceed 150 characters').optional().nullable(),
    status: z.enum(['LEAD', 'ACTIVE', 'UNSUBSCRIBED', 'ARCHIVED']),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;
