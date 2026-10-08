import { Router } from "express";
import { formFieldsController } from "../forms.module.js";
import { AuthMiddleware } from "../../../app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "../../../app/middleware/Validated.middleware.js";
import {
    UpdateFormFieldBodySchema,
    FormFieldIdParamSchema,
} from "./validators/form-fields.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.routeProtect);

router.get(
    "/:id",
    authMiddleware.checkPermission("form-fields:read"),
    validatedMiddleware.validateParams(FormFieldIdParamSchema),
    formFieldsController.getById
);

router.put(
    "/:id",
    authMiddleware.checkPermission("form-fields:update"),
    validatedMiddleware.validateParams(FormFieldIdParamSchema),
    validatedMiddleware.validateBody(UpdateFormFieldBodySchema),
    formFieldsController.update
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("form-fields:delete"),
    validatedMiddleware.validateParams(FormFieldIdParamSchema),
    formFieldsController.delete
);

export default router;
