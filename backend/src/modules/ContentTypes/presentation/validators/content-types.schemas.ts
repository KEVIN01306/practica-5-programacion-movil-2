import { z } from "zod";

export const CreateContentTypeBodySchema = z.object({
    websiteId: z.string().uuid("Invalid Website ID"),
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
    slug: z
        .string()
        .trim()
        .min(2, "Slug must be at least 2 characters")
        .max(100, "Slug must not exceed 100 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers and hyphens (e.g. blog-posts)"),
    description: z.string().trim().max(500, "Description must not exceed 500 characters").optional().nullable(),
});

export const UpdateContentTypeBodySchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters").optional(),
    slug: z
        .string()
        .trim()
        .min(2, "Slug must be at least 2 characters")
        .max(100, "Slug must not exceed 100 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers and hyphens (e.g. blog-posts)")
        .optional(),
    description: z.string().trim().max(500, "Description must not exceed 500 characters").optional().nullable(),
});

export const ContentTypeIdParamSchema = z.object({
    id: z.string().uuid("Invalid Content Type ID"),
});

export const ListContentTypesQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    search: z.string().trim().optional(),
    websiteId: z.string().uuid("Invalid Website ID").optional(),
});
