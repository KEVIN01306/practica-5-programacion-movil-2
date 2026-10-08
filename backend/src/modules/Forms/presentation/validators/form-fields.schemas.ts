import { z } from "zod";

const FieldTypeEnum = z.enum([
    "STRING",
    "TEXT",
    "NUMBER",
    "BOOLEAN",
    "DATE",
    "JSON",
    "URL",
]);

export const CreateFormFieldBodySchema = z.object({
    label: z.string().trim().min(1, "Label is required").max(100, "Label must not exceed 100 characters"),
    key: z
        .string()
        .trim()
        .min(1, "Key is required")
        .max(64, "Key must not exceed 64 characters")
        .regex(/^[a-z0-9_]+$/, "Key must contain only lowercase letters, numbers, and underscores (e.g. user_phone)"),
    type: FieldTypeEnum.default("STRING"),
    isRequired: z.boolean().optional().default(false),
});

export const UpdateFormFieldBodySchema = z.object({
    label: z.string().trim().min(1, "Label is required").max(100, "Label must not exceed 100 characters").optional(),
    key: z
        .string()
        .trim()
        .min(1, "Key is required")
        .max(64, "Key must not exceed 64 characters")
        .regex(/^[a-z0-9_]+$/, "Key must contain only lowercase letters, numbers, and underscores (e.g. user_phone)")
        .optional(),
    type: FieldTypeEnum.optional(),
    isRequired: z.boolean().optional(),
});

export const BulkCreateFormFieldsBodySchema = z.object({
    fields: z.array(CreateFormFieldBodySchema).min(1, "At least one field is required"),
});

export const FormFieldIdParamSchema = z.object({
    id: z.string().uuid("Invalid Form Field ID"),
});

export const FormIdInParamsSchema = z.object({
    formId: z.string().uuid("Invalid Form ID"),
});
