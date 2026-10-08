import { z } from 'zod';

export const SendEmailSchema = z.object({
    to: z.union([
        z.string().trim().email('Invalid email address format'),
        z.array(z.string().trim().email('Invalid email address format')).min(1, 'At least one recipient email is required'),
    ]),
    subject: z.string().trim().min(1, 'Subject is required').max(300, 'Subject must not exceed 300 characters'),
    html: z.string().trim().min(1, 'HTML content is required'),
    text: z.string().trim().optional(),
    from: z.string().trim().optional(),
    replyTo: z.union([z.string().trim().email(), z.array(z.string().trim().email())]).optional(),
});

export type SendEmailDto = z.infer<typeof SendEmailSchema>;
