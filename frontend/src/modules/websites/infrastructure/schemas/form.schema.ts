import { z } from 'zod';

export const FormFormSchema = z
    .object({
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
                'Slug must contain only lowercase letters, numbers, and hyphens (e.g. contact-form)'
            ),
        sendEmail: z.boolean(),
        emailFromUser: z
            .string()
            .trim()
            .regex(/^[a-zA-Z0-9._-]*$/, 'Only alphanumeric characters, dots, dashes and underscores are allowed')
            .optional()
            .nullable(),
        recipientEmails: z.array(z.string().email('Invalid email format')),
        emailTemplateId: z.string().nullable().optional(),
    })
    .refine(
        (data) => {
            if (data.sendEmail) {
                return (
                    Array.isArray(data.recipientEmails) &&
                    data.recipientEmails.length > 0 &&
                    data.recipientEmails.every((e) => Boolean(e) && e.includes('@'))
                );
            }
            return true;
        },
        {
            message: 'At least one recipient email is required when email notifications are enabled',
            path: ['recipientEmails'],
        }
    );

export type FormFormData = z.infer<typeof FormFormSchema>;
