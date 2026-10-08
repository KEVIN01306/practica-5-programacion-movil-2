import { Router } from "express";
import {
    contentTypesController,
    contentFieldsController,
    contentItemsController,
} from "../content-types.module.js";
import { AuthMiddleware } from "../../../app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "../../../app/middleware/Validated.middleware.js";
import {
    CreateContentTypeBodySchema,
    UpdateContentTypeBodySchema,
    ContentTypeIdParamSchema,
    ListContentTypesQuerySchema,
} from "./validators/content-types.schemas.js";
import {
    CreateContentFieldBodySchema,
    ContentTypeIdInParamsSchema,
    BulkCreateContentFieldsBodySchema,
} from "./validators/content-fields.schemas.js";
import {
    CreateContentItemBodySchema,
    BulkCreateContentItemsBodySchema,
} from "./validators/content-items.schemas.js";

const router = Router({ mergeParams: true });
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Apply auth middleware to all content-type routes
router.use(authMiddleware.routeProtect);

// Content Types endpoints
router.post(
    "/",
    authMiddleware.checkPermission("content-types:create"),
    validatedMiddleware.validateBody(CreateContentTypeBodySchema),
    contentTypesController.create
);

router.get(
    "/",
    authMiddleware.checkPermission("content-types:read"),
    validatedMiddleware.validateQuery(ListContentTypesQuerySchema),
    contentTypesController.list
);

router.get(
    "/:id",
    authMiddleware.checkPermission("content-types:read"),
    validatedMiddleware.validateParams(ContentTypeIdParamSchema),
    contentTypesController.getById
);

router.put(
    "/:id",
    authMiddleware.checkPermission("content-types:update"),
    validatedMiddleware.validateParams(ContentTypeIdParamSchema),
    validatedMiddleware.validateBody(UpdateContentTypeBodySchema),
    contentTypesController.update
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("content-types:delete"),
    validatedMiddleware.validateParams(ContentTypeIdParamSchema),
    contentTypesController.delete
);

// Nested Content Fields for a Content Type
router.get(
    "/:contentTypeId/fields",
    authMiddleware.checkPermission("content-fields:read"),
    validatedMiddleware.validateParams(ContentTypeIdInParamsSchema),
    contentFieldsController.listByContentType
);

router.get(
    "/:contentTypeId/fields/export/json",
    authMiddleware.checkPermission("content-fields:read"),
    validatedMiddleware.validateParams(ContentTypeIdInParamsSchema),
    contentFieldsController.exportJson
);

router.post(
    "/:contentTypeId/fields",
    authMiddleware.checkPermission("content-fields:create"),
    validatedMiddleware.validateParams(ContentTypeIdInParamsSchema),
    validatedMiddleware.validateBody(CreateContentFieldBodySchema),
    contentFieldsController.create
);

router.post(
    "/:contentTypeId/fields/bulk",
    authMiddleware.checkPermission("content-fields:create"),
    validatedMiddleware.validateParams(ContentTypeIdInParamsSchema),
    validatedMiddleware.validateBody(BulkCreateContentFieldsBodySchema),
    contentFieldsController.bulkCreate
);

// Nested Content Items for a Content Type
router.get(
    "/:contentTypeId/items",
    authMiddleware.checkPermission("content-items:read"),
    validatedMiddleware.validateParams(ContentTypeIdInParamsSchema),
    contentItemsController.listByContentType
);

router.post(
    "/:contentTypeId/items",
    authMiddleware.checkPermission("content-items:create"),
    validatedMiddleware.validateParams(ContentTypeIdInParamsSchema),
    validatedMiddleware.validateBody(CreateContentItemBodySchema),
    contentItemsController.create
);

router.post(
    "/:contentTypeId/items/bulk",
    authMiddleware.checkPermission("content-items:create"),
    validatedMiddleware.validateParams(ContentTypeIdInParamsSchema),
    validatedMiddleware.validateBody(BulkCreateContentItemsBodySchema),
    contentItemsController.bulkCreate
);

export default router;
