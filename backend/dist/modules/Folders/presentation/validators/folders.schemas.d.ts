import { z } from "zod";
export declare const CreateFolderSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    brandId: z.ZodString;
    parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const UpdateFolderSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const FolderIdSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const CopyFolderSchema: z.ZodObject<{
    targetBrandId: z.ZodString;
    targetParentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=folders.schemas.d.ts.map