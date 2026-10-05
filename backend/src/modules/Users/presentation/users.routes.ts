import { Router } from "express";
import { usersController } from "../users.module.js";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { CreateUserSchema, UpdateUserSchema, UserIdSchema, ChangePasswordSchema } from "./users.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Protect routes - requires authentication
router.use(authMiddleware.routeProtect);

router.get(
    "/roles",
    authMiddleware.checkPermissionSome(["users:create", "users:update", "roles:read", "users:read"]),
    usersController.listRoles
);

router.patch(
    "/me/password",
    validatedMiddleware.validateBody(ChangePasswordSchema),
    usersController.changePassword
);

router.get(
    "/",
    authMiddleware.checkPermission("users:read"),
    usersController.list
);

router.post(
    "/",
    authMiddleware.checkPermission("users:create"),
    validatedMiddleware.validateBody(CreateUserSchema),
    usersController.create
);

router.put(
    "/:id",
    authMiddleware.checkPermission("users:update"),
    validatedMiddleware.validateParams(UserIdSchema),
    validatedMiddleware.validateBody(UpdateUserSchema),
    usersController.update
);

router.patch(
    "/:id/activate",
    authMiddleware.checkPermission("users:update"),
    validatedMiddleware.validateParams(UserIdSchema),
    usersController.activate
);

router.patch(
    "/:id/disable",
    authMiddleware.checkPermission("users:update"),
    validatedMiddleware.validateParams(UserIdSchema),
    usersController.disable
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("users:delete"),
    validatedMiddleware.validateParams(UserIdSchema),
    usersController.delete
);

export default router;
