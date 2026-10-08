import { Router } from "express";
import {
    formsController,
    formFieldsController,
    formSubmissionsController,
} from "../forms.module.js";
import { AuthMiddleware } from "../../../app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "../../../app/middleware/Validated.middleware.js";
import {
    CreateFormBodySchema,
    UpdateFormBodySchema,
    FormIdParamSchema,
    ListFormsQuerySchema,
} from "./validators/forms.schemas.js";
import {
    CreateFormFieldBodySchema,
    BulkCreateFormFieldsBodySchema,
    FormIdInParamsSchema,
} from "./validators/form-fields.schemas.js";
import { ListFormSubmissionsQuerySchema } from "./validators/form-submissions.schemas.js";

const router = Router({ mergeParams: true });
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Apply auth middleware to all admin form routes
router.use(authMiddleware.routeProtect);

// ======================================================
// Forms CRUD Endpoints
// ======================================================
router.post(
    "/",
    authMiddleware.checkPermission("forms:create"),
    validatedMiddleware.validateBody(CreateFormBodySchema),
    formsController.create
);

router.get(
    "/",
    authMiddleware.checkPermission("forms:read"),
    validatedMiddleware.validateQuery(ListFormsQuerySchema),
    formsController.list
);

router.get(
    "/:id",
    authMiddleware.checkPermission("forms:read"),
    validatedMiddleware.validateParams(FormIdParamSchema),
    formsController.getById
);

router.put(
    "/:id",
    authMiddleware.checkPermission("forms:update"),
    validatedMiddleware.validateParams(FormIdParamSchema),
    validatedMiddleware.validateBody(UpdateFormBodySchema),
    formsController.update
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("forms:delete"),
    validatedMiddleware.validateParams(FormIdParamSchema),
    formsController.delete
);

// ======================================================
// Nested Form Fields Endpoints
// ======================================================
router.get(
    "/:formId/fields",
    authMiddleware.checkPermission("form-fields:read"),
    validatedMiddleware.validateParams(FormIdInParamsSchema),
    formFieldsController.listByForm
);

router.post(
    "/:formId/fields",
    authMiddleware.checkPermission("form-fields:create"),
    validatedMiddleware.validateParams(FormIdInParamsSchema),
    validatedMiddleware.validateBody(CreateFormFieldBodySchema),
    formFieldsController.create
);

router.post(
    "/:formId/fields/bulk",
    authMiddleware.checkPermission("form-fields:create"),
    validatedMiddleware.validateParams(FormIdInParamsSchema),
    validatedMiddleware.validateBody(BulkCreateFormFieldsBodySchema),
    formFieldsController.bulkCreate
);

// ======================================================
// Nested Form Submissions Endpoints
// ======================================================
router.get(
    "/:formId/submissions",
    authMiddleware.checkPermission("form-submissions:read"),
    validatedMiddleware.validateParams(FormIdInParamsSchema),
    validatedMiddleware.validateQuery(ListFormSubmissionsQuerySchema),
    formSubmissionsController.list
);

export default router;
