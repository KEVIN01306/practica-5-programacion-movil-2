import { z } from "zod";
import { AssetType } from "@prisma/client";

export const AssetIdSchema = z.object({
    id: z.string().uuid("Invalid asset ID format"),
});

export const CreateAssetBodySchema = z.object({
    name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),
    description: z.string().max(2000, "Description cannot exceed 2000 characters").optional().nullable(),
    sku: z.string().max(100, "SKU cannot exceed 100 characters").optional().nullable(),
    brandId: z.string().uuid("Invalid brand ID format"),
    folderId: z
        .string()
        .uuid("Invalid folder ID format")
        .optional()
        .nullable()
        .or(z.literal(""))
        .or(z.literal("null")),
});

export const UpdateAssetBodySchema = z.object({
    name: z.string().min(1, "Name cannot be empty").max(255, "Name cannot exceed 255 characters").optional(),
    description: z.string().max(2000, "Description cannot exceed 2000 characters").optional().nullable(),
    sku: z.string().max(100, "SKU cannot exceed 100 characters").optional().nullable(),
    brandId: z.string().uuid("Invalid brand ID format").optional(),
    folderId: z
        .string()
        .uuid("Invalid folder ID format")
        .optional()
        .nullable()
        .or(z.literal(""))
        .or(z.literal("null")),
});

export const ListAssetsQuerySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    brandId: z.string().uuid().optional(),
    folderId: z.string().optional(),
    type: z.nativeEnum(AssetType).optional(),
    sku: z.string().optional(),
    q: z.string().optional(),
});

export const CopyAssetBodySchema = z.object({
    targetBrandId: z.string().uuid("Invalid target brand ID format"),
    targetFolderId: z
        .string()
        .uuid("Invalid target folder ID format")
        .optional()
        .nullable()
        .or(z.literal(""))
        .or(z.literal("null")),
});

