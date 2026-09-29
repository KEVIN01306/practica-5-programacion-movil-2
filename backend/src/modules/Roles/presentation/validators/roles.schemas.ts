import { z } from "zod";

export const CreateRoleSchema = z.object({
    name: z.string().min(2, "Role name must be at least 2 characters long").max(50, "Role name must not exceed 50 characters"),
    description: z.string().max(255, "Description must not exceed 255 characters").nullable().optional(),
});

export const UpdateRoleSchema = z.object({
    name: z.string().min(2, "Role name must be at least 2 characters long").max(50, "Role name must not exceed 50 characters").optional(),
    description: z.string().max(255, "Description must not exceed 255 characters").nullable().optional(),
});

export const RoleIdSchema = z.object({
    id: z.string().uuid("Invalid role ID format"),
});

export const RolePermissionParamSchema = z.object({
    roleId: z.string().uuid("Invalid role ID format"),
});

export const UpdateRolePermissionsSchema = z.object({
    permissionIds: z.array(z.string().uuid("Invalid permission ID format")),
});
