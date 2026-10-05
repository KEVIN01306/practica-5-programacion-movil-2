import { Router } from "express";
import { rolesController } from "../roles.module.js";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import {
    CreateRoleSchema,
    UpdateRoleSchema,
    RoleIdSchema,
    RolePermissionParamSchema,
    UpdateRolePermissionsSchema,
} from "./validators/roles.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Protect all role routes - requires authentication
router.use(authMiddleware.routeProtect);

// Permissions catalog and matrix routes (must precede /:id)
router.get(
    "/matrix",
    authMiddleware.checkPermissionSome(["roles:read", "roles:permissions:update"]),
    rolesController.getMatrix
);

router.get(
    "/permissions",
    authMiddleware.checkPermissionSome(["roles:read", "roles:permissions:update"]),
    rolesController.listPermissions
);

// Role CRUD routes
router.get(
    "/",
    authMiddleware.checkPermission("roles:read"),
    rolesController.list
);

router.post(
    "/",
    authMiddleware.checkPermission("roles:create"),
    validatedMiddleware.validateBody(CreateRoleSchema),
    rolesController.create
);

router.get(
    "/:id",
    authMiddleware.checkPermission("roles:read"),
    validatedMiddleware.validateParams(RoleIdSchema),
    rolesController.getById
);

router.patch(
    "/:id",
    authMiddleware.checkPermission("roles:update"),
    validatedMiddleware.validateParams(RoleIdSchema),
    validatedMiddleware.validateBody(UpdateRoleSchema),
    rolesController.update
);

router.put(
    "/:id",
    authMiddleware.checkPermission("roles:update"),
    validatedMiddleware.validateParams(RoleIdSchema),
    validatedMiddleware.validateBody(UpdateRoleSchema),
    rolesController.update
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("roles:delete"),
    validatedMiddleware.validateParams(RoleIdSchema),
    rolesController.delete
);

// Role-Permissions management routes
router.get(
    "/:roleId/permissions",
    authMiddleware.checkPermissionSome(["roles:read", "roles:permissions:update"]),
    validatedMiddleware.validateParams(RolePermissionParamSchema),
    rolesController.getRolePermissions
);

router.put(
    "/:roleId/permissions",
    authMiddleware.checkPermissionSome(["roles:permissions:update", "roles:update"]),
    validatedMiddleware.validateParams(RolePermissionParamSchema),
    validatedMiddleware.validateBody(UpdateRolePermissionsSchema),
    rolesController.updateRolePermissions
);

export default router;
