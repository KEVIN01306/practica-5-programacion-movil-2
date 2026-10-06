import { z } from "zod";
export declare const AssetIdSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const CreateAssetBodySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    sku: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    brandId: z.ZodString;
    folderId: z.ZodUnion<[z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>, z.ZodLiteral<"null">]>;
}, z.core.$strip>;
export declare const UpdateAssetBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    sku: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    brandId: z.ZodOptional<z.ZodString>;
    folderId: z.ZodUnion<[z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>, z.ZodLiteral<"null">]>;
}, z.core.$strip>;
export declare const ListAssetsQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
    brandId: z.ZodOptional<z.ZodString>;
    folderId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        IMAGE: "IMAGE";
        DOCUMENT: "DOCUMENT";
        VIDEO: "VIDEO";
        AUDIO: "AUDIO";
        ARCHIVE: "ARCHIVE";
        OTHER: "OTHER";
    }>>;
    sku: z.ZodOptional<z.ZodString>;
    q: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CopyAssetBodySchema: z.ZodObject<{
    targetBrandId: z.ZodString;
    targetFolderId: z.ZodUnion<[z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>, z.ZodLiteral<"null">]>;
}, z.core.$strip>;
//# sourceMappingURL=assets.schemas.d.ts.map