import { z } from "zod";

export const FieldTypeSchema = z.enum(["STRING", "TEXT", "NUMBER", "BOOLEAN", "DATE", "JSON", "URL"]);

export const CreateContentFieldBodySchema = z.object({
    contentTypeId: z.string().uuid("Invalid Content Type ID").optional(),
    name: z.string().trim().min(1, "Name is required").max(100, "Name must not exceed 100 characters"),
    key: z
        .string()
        .trim()
        .min(1, "Key is required")
        .max(100, "Key must not exceed 100 characters")
        .regex(/^[a-z0-9_]+$/, "Key must contain only lowercase letters, numbers and underscores (e.g. in_stock)"),
    type: FieldTypeSchema,
    isRequired: z.boolean().optional().default(false),
});

export const UpdateContentFieldBodySchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name must not exceed 100 characters").optional(),
    key: z
        .string()
        .trim()
        .min(1, "Key is required")
        .max(100, "Key must not exceed 100 characters")
        .regex(/^[a-z0-9_]+$/, "Key must contain only lowercase letters, numbers and underscores (e.g. in_stock)")
        .optional(),
    type: FieldTypeSchema.optional(),
    isRequired: z.boolean().optional(),
});

export const ContentFieldIdParamSchema = z.object({
    id: z.string().uuid("Invalid Content Field ID"),
});

export const ContentTypeIdInParamsSchema = z.object({
    contentTypeId: z.string().uuid("Invalid Content Type ID"),
});

export const BulkCreateContentFieldsBodySchema = z.union([
    z.array(
        z.object({
            name: z.string().trim().min(1, "Name is required"),
            key: z.string().trim().min(1, "Key is required"),
            type: FieldTypeSchema,
            isRequired: z.boolean().optional().default(false),
        })
    ).min(1, "At least one field is required"),
    z.object({
        fields: z.array(
            z.object({
                name: z.string().trim().min(1, "Name is required"),
                key: z.string().trim().min(1, "Key is required"),
                type: FieldTypeSchema,
                isRequired: z.boolean().optional().default(false),
            })
        ).min(1, "At least one field is required"),
    }),
]);
