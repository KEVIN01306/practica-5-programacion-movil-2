import { z } from "zod";

export const CreateEmailTemplateBodySchema = z.object({
    websiteId: z.string().uuid("Invalid Website ID").optional(),
    name: z.string().trim().min(1, "Name is required").max(150, "Name must not exceed 150 characters"),
    subject: z.string().trim().min(1, "Subject is required").max(255, "Subject must not exceed 255 characters"),
    htmlContent: z.string().min(1, "HTML content is required"),
});

export const UpdateEmailTemplateBodySchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(150, "Name must not exceed 150 characters").optional(),
    subject: z.string().trim().min(1, "Subject is required").max(255, "Subject must not exceed 255 characters").optional(),
    htmlContent: z.string().min(1, "HTML content is required").optional(),
});

export const EmailTemplateIdParamSchema = z.object({
    id: z.string().uuid("Invalid Email Template ID"),
});

export const ListEmailTemplatesQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    search: z.string().trim().optional(),
    websiteId: z.string().uuid("Invalid Website ID").optional(),
});
