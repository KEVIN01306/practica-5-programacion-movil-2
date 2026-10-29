import { z } from "zod";

export const CreateProductSchema = z.object({
    code: z.string().trim().min(1, "Barcode/code is required").max(100),
    name: z.string().trim().min(1, "Product name is required").max(150),
    description: z.string().trim().max(1000).optional().nullable(),
    costPrice: z.coerce.number().min(0, "Cost price must be greater than or equal to 0"),
    salePrice: z.coerce.number().min(0, "Sale price must be greater than or equal to 0"),
    currentStock: z.coerce.number().int().min(0, "Initial stock cannot be negative").default(0),
    minStock: z.coerce.number().int().min(0, "Minimum stock cannot be negative").default(0),
    imageUrl: z.string().url("Invalid image URL").optional().nullable(),
    categoryId: z.string().uuid("Invalid category ID format"),
});

export const UpdateProductSchema = z.object({
    code: z.string().trim().min(1, "Barcode/code must not be empty").max(100).optional(),
    name: z.string().trim().min(1, "Product name must not be empty").max(150).optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    costPrice: z.coerce.number().min(0, "Cost price must be greater than or equal to 0").optional(),
    salePrice: z.coerce.number().min(0, "Sale price must be greater than or equal to 0").optional(),
    minStock: z.coerce.number().int().min(0, "Minimum stock cannot be negative").optional(),
    imageUrl: z.string().url("Invalid image URL").optional().nullable(),
    categoryId: z.string().uuid("Invalid category ID format").optional(),
});

export const ProductIdSchema = z.object({
    id: z.string().uuid("Invalid product ID format"),
});

export const ProductCodeSchema = z.object({
    code: z.string().trim().min(1, "Code parameter is required"),
});

export const ListProductsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    categoryId: z.string().uuid().optional(),
    lowStock: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
});
