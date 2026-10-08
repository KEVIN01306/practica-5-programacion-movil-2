import { z } from "zod";

export const CreateContentItemBodySchema = z.object({
    contentTypeId: z.string().uuid("Invalid Content Type ID").optional(),
    data: z.record(z.string(), z.any()),
    isPublished: z.boolean().optional().default(true),
});

export const UpdateContentItemBodySchema = z.object({
    data: z.record(z.string(), z.any()).optional(),
    isPublished: z.boolean().optional(),
});

export const ContentItemIdParamSchema = z.object({
    id: z.string().uuid("Invalid Content Item ID"),
});

export const BulkCreateContentItemsBodySchema = z.union([
    z.object({
        items: z.array(z.record(z.string(), z.any())).min(1, "At least one item is required"),
        isPublished: z.boolean().optional(),
    }),
    z.array(z.record(z.string(), z.any())).min(1, "At least one item is required"),
]);

export const ListContentItemsQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    isPublished: z
        .enum(["true", "false"])
        .transform((val) => val === "true")
        .optional(),
    search: z.string().trim().optional(),
});
