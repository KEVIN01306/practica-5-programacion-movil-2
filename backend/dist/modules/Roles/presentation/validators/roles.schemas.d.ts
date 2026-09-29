import { z } from "zod";
export declare const CreateRoleSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const UpdateRoleSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const RoleIdSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const RolePermissionParamSchema: z.ZodObject<{
    roleId: z.ZodString;
}, z.core.$strip>;
export declare const UpdateRolePermissionsSchema: z.ZodObject<{
    permissionIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=roles.schemas.d.ts.map