import { z } from "zod";

export const CreateCategorySchema = z.object({
    name: z.string().trim().min(1, "Category name is required").max(100),
    description: z.string().trim().max(500).optional().nullable(),
});

export const UpdateCategorySchema = z.object({
    name: z.string().trim().min(1, "Category name must not be empty").max(100).optional(),
    description: z.string().trim().max(500).optional().nullable(),
});

export const CategoryIdSchema = z.object({
    id: z.string().uuid("Invalid category ID format"),
});
