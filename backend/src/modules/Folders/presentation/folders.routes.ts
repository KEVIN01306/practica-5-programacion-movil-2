import { Router } from "express";
import { foldersController } from "../folders.module.js";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { CreateFolderSchema, UpdateFolderSchema, FolderIdSchema, CopyFolderSchema } from "./validators/folders.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Protect all folder routes - require authentication
router.use(authMiddleware.routeProtect);

router.get(
    "/",
    authMiddleware.checkPermissionSome(["folders:read", "assets:read", "brands:read"]),
    foldersController.list
);

router.get(
    "/:id",
    authMiddleware.checkPermissionSome(["folders:read", "assets:read", "brands:read"]),
    validatedMiddleware.validateParams(FolderIdSchema),
    foldersController.getById
);

router.post(
    "/",
    authMiddleware.checkPermission("folders:create"),
    validatedMiddleware.validateBody(CreateFolderSchema),
    foldersController.create
);

// POST /:id/copy: duplicate folder recursively
router.post(
    "/:id/copy",
    authMiddleware.checkPermission("folders:create"),
    validatedMiddleware.validateParams(FolderIdSchema),
    validatedMiddleware.validateBody(CopyFolderSchema),
    foldersController.copy
);

router.put(
    "/:id",
    authMiddleware.checkPermission("folders:update"),
    validatedMiddleware.validateParams(FolderIdSchema),
    validatedMiddleware.validateBody(UpdateFolderSchema),
    foldersController.update
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("folders:delete"),
    validatedMiddleware.validateParams(FolderIdSchema),
    foldersController.delete
);

export default router;

