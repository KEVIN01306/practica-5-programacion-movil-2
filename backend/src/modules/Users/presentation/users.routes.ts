import { Router } from "express";
import { usersController } from "../users.module.js";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { CreateUserSchema, UpdateUserSchema, UserIdSchema, ChangePasswordSchema } from "./users.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// All routes require authentication
router.use(authMiddleware.routeProtect);

router.patch(
    "/me/password",
    validatedMiddleware.validateBody(ChangePasswordSchema),
    usersController.changePassword
);

router.get(
    "/roles",
    usersController.listRoles
);

router.get(
    "/",
    authMiddleware.checkRole(["ADMIN"]),
    usersController.list
);

router.post(
    "/",
    authMiddleware.checkRole(["ADMIN"]),
    validatedMiddleware.validateBody(CreateUserSchema),
    usersController.create
);

router.put(
    "/:id",
    authMiddleware.checkRole(["ADMIN"]),
    validatedMiddleware.validateParams(UserIdSchema),
    validatedMiddleware.validateBody(UpdateUserSchema),
    usersController.update
);

router.patch(
    "/:id/activate",
    authMiddleware.checkRole(["ADMIN"]),
    validatedMiddleware.validateParams(UserIdSchema),
    usersController.activate
);

router.patch(
    "/:id/disable",
    authMiddleware.checkRole(["ADMIN"]),
    validatedMiddleware.validateParams(UserIdSchema),
    usersController.disable
);

router.delete(
    "/:id",
    authMiddleware.checkRole(["ADMIN"]),
    validatedMiddleware.validateParams(UserIdSchema),
    usersController.delete
);

export default router;
