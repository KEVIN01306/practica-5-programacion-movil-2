import { Router } from "express";
import { contentFieldsController } from "../content-types.module.js";
import { AuthMiddleware } from "../../../app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "../../../app/middleware/Validated.middleware.js";
import {
    ContentFieldIdParamSchema,
    UpdateContentFieldBodySchema,
    CreateContentFieldBodySchema,
} from "./validators/content-fields.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Apply auth middleware to all content-field routes
router.use(authMiddleware.routeProtect);

router.post(
    "/",
    authMiddleware.checkPermission("content-fields:create"),
    validatedMiddleware.validateBody(CreateContentFieldBodySchema),
    contentFieldsController.create
);

router.get(
    "/:id",
    authMiddleware.checkPermission("content-fields:read"),
    validatedMiddleware.validateParams(ContentFieldIdParamSchema),
    contentFieldsController.getById
);

router.put(
    "/:id",
    authMiddleware.checkPermission("content-fields:update"),
    validatedMiddleware.validateParams(ContentFieldIdParamSchema),
    validatedMiddleware.validateBody(UpdateContentFieldBodySchema),
    contentFieldsController.update
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("content-fields:delete"),
    validatedMiddleware.validateParams(ContentFieldIdParamSchema),
    contentFieldsController.delete
);

export default router;
