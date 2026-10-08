import { Router } from "express";
import { contentItemsController } from "../content-types.module.js";
import { AuthMiddleware } from "../../../app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "../../../app/middleware/Validated.middleware.js";
import {
    ContentItemIdParamSchema,
    UpdateContentItemBodySchema,
    CreateContentItemBodySchema,
} from "./validators/content-items.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Apply auth middleware to all content-item routes
router.use(authMiddleware.routeProtect);

router.post(
    "/",
    authMiddleware.checkPermission("content-items:create"),
    validatedMiddleware.validateBody(CreateContentItemBodySchema),
    contentItemsController.create
);

router.get(
    "/:id",
    authMiddleware.checkPermission("content-items:read"),
    validatedMiddleware.validateParams(ContentItemIdParamSchema),
    contentItemsController.getById
);

router.put(
    "/:id",
    authMiddleware.checkPermission("content-items:update"),
    validatedMiddleware.validateParams(ContentItemIdParamSchema),
    validatedMiddleware.validateBody(UpdateContentItemBodySchema),
    contentItemsController.update
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("content-items:delete"),
    validatedMiddleware.validateParams(ContentItemIdParamSchema),
    contentItemsController.delete
);

export default router;
