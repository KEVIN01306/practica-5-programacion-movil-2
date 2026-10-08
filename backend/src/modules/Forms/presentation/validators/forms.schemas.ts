import { z } from "zod";

export const CreateFormBodySchema = z.object({
    websiteId: z.string().uuid("Invalid Website ID").optional(),
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
    slug: z
        .string()
        .trim()
        .min(2, "Slug must be at least 2 characters")
        .max(100, "Slug must not exceed 100 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens (e.g. contact-us)"),
    sendEmail: z.boolean().optional().default(false),
    emailFrom: z.string().trim().optional().nullable(),
    recipientEmails: z
        .array(z.string().email("Invalid email address"))
        .optional()
        .nullable(),
    emailTemplateId: z.string().uuid("Invalid Email Template ID").optional().nullable(),
});

export const UpdateFormBodySchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters").optional(),
    slug: z
        .string()
        .trim()
        .min(2, "Slug must be at least 2 characters")
        .max(100, "Slug must not exceed 100 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens (e.g. contact-us)")
        .optional(),
    sendEmail: z.boolean().optional(),
    emailFrom: z.string().trim().optional().nullable(),
    recipientEmails: z
        .array(z.string().email("Invalid email address"))
        .optional()
        .nullable(),
    emailTemplateId: z.string().uuid("Invalid Email Template ID").optional().nullable(),
});

export const FormIdParamSchema = z.object({
    id: z.string().uuid("Invalid Form ID"),
});

export const ListFormsQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    search: z.string().trim().optional(),
    websiteId: z.string().uuid("Invalid Website ID").optional(),
});
