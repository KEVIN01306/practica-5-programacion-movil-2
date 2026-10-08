import { z } from 'zod';

export const EmailTemplateFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Template name is required')
        .max(150, 'Template name must not exceed 150 characters'),
    subject: z
        .string()
        .trim()
        .min(1, 'Subject is required')
        .max(255, 'Subject must not exceed 255 characters'),
    htmlContent: z
        .string()
        .min(1, 'HTML content is required'),
});

export type EmailTemplateFormData = z.infer<typeof EmailTemplateFormSchema>;
