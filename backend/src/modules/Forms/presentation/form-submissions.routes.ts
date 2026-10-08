import { Router } from "express";
import { formSubmissionsController } from "../forms.module.js";
import { AuthMiddleware } from "../../../app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "../../../app/middleware/Validated.middleware.js";
import {
    UpdateSubmissionStatusBodySchema,
    FormSubmissionIdParamSchema,
    ListFormSubmissionsQuerySchema,
} from "./validators/form-submissions.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.routeProtect);

router.get(
    "/",
    authMiddleware.checkPermission("form-submissions:read"),
    validatedMiddleware.validateQuery(ListFormSubmissionsQuerySchema),
    formSubmissionsController.list
);

router.get(
    "/:id",
    authMiddleware.checkPermission("form-submissions:read"),
    validatedMiddleware.validateParams(FormSubmissionIdParamSchema),
    formSubmissionsController.getById
);

router.patch(
    "/:id/status",
    authMiddleware.checkPermission("form-submissions:update"),
    validatedMiddleware.validateParams(FormSubmissionIdParamSchema),
    validatedMiddleware.validateBody(UpdateSubmissionStatusBodySchema),
    formSubmissionsController.updateStatus
);

router.put(
    "/:id/status",
    authMiddleware.checkPermission("form-submissions:update"),
    validatedMiddleware.validateParams(FormSubmissionIdParamSchema),
    validatedMiddleware.validateBody(UpdateSubmissionStatusBodySchema),
    formSubmissionsController.updateStatus
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("form-submissions:delete"),
    validatedMiddleware.validateParams(FormSubmissionIdParamSchema),
    formSubmissionsController.delete
);

export default router;
