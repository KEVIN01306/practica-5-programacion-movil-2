import { z } from "zod";

export const WebsiteIdParamSchema = z.object({
    id: z.string().uuid("Invalid website ID format"),
});

export const CreateWebsiteBodySchema = z.object({
    name: z.string().min(1, "Name is required").max(255, "Name is too long"),
    domain: z
        .string()
        .min(1, "Domain is required")
        .max(255, "Domain is too long")
        .regex(
            /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|localhost(?::\d+)?$/,
            "Invalid domain format (e.g., example.com, app.example.com)"
        ),
    hostingProvider: z.string().max(255).optional().nullable(),
    hostingNotes: z.string().optional().nullable(),
    isActive: z.boolean().optional().default(true),
    ownerId: z.string().uuid("Invalid owner ID format").optional().nullable(),
});

export const UpdateWebsiteBodySchema = z.object({
    name: z.string().min(1, "Name is required").max(255, "Name is too long").optional(),
    domain: z
        .string()
        .min(1, "Domain is required")
        .max(255, "Domain is too long")
        .regex(
            /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|localhost(?::\d+)?$/,
            "Invalid domain format (e.g., example.com, app.example.com)"
        )
        .optional(),
    hostingProvider: z.string().max(255).optional().nullable(),
    hostingNotes: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    ownerId: z.string().uuid("Invalid owner ID format").optional().nullable(),
});

export const ListWebsitesQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    isActive: z
        .preprocess((val) => {
            if (val === "true" || val === true) return true;
            if (val === "false" || val === false) return false;
            return undefined;
        }, z.boolean().optional())
        .optional(),
    ownerId: z.string().uuid().optional(),
});
