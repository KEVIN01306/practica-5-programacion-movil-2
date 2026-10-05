import { Router } from "express";
import { brandsController } from "../brands.module.js";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { CreateBrandSchema, UpdateBrandSchema, BrandIdSchema } from "./validators/brands.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Protect all brand routes - require authentication
router.use(authMiddleware.routeProtect);

router.get(
    "/stats",
    authMiddleware.checkPermissionSome(["brands:read", "assets:read", "folders:read"]),
    brandsController.stats
);

router.get(
    "/",
    authMiddleware.checkPermissionSome(["brands:read", "assets:read", "folders:read"]),
    brandsController.list
);

router.get(
    "/:id",
    authMiddleware.checkPermissionSome(["brands:read", "assets:read", "folders:read"]),
    validatedMiddleware.validateParams(BrandIdSchema),
    brandsController.getById
);

router.post(
    "/",
    authMiddleware.checkPermission("brands:create"),
    validatedMiddleware.validateBody(CreateBrandSchema),
    brandsController.create
);

router.put(
    "/:id",
    authMiddleware.checkPermission("brands:update"),
    validatedMiddleware.validateParams(BrandIdSchema),
    validatedMiddleware.validateBody(UpdateBrandSchema),
    brandsController.update
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("brands:delete"),
    validatedMiddleware.validateParams(BrandIdSchema),
    brandsController.delete
);

export default router;
