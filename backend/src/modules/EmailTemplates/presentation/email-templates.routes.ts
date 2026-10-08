import { Router } from "express";
import { emailTemplatesController } from "../email-templates.module.js";
import { AuthMiddleware } from "../../../app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "../../../app/middleware/Validated.middleware.js";
import {
    CreateEmailTemplateBodySchema,
    UpdateEmailTemplateBodySchema,
    EmailTemplateIdParamSchema,
    ListEmailTemplatesQuerySchema,
} from "./validators/email-templates.schemas.js";

const router = Router({ mergeParams: true });
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Apply auth middleware to all email template routes
router.use(authMiddleware.routeProtect);

router.post(
    "/",
    authMiddleware.checkPermission("email-templates:create"),
    validatedMiddleware.validateBody(CreateEmailTemplateBodySchema),
    emailTemplatesController.create
);

router.get(
    "/",
    authMiddleware.checkPermission("email-templates:read"),
    validatedMiddleware.validateQuery(ListEmailTemplatesQuerySchema),
    emailTemplatesController.list
);

router.get(
    "/:id",
    authMiddleware.checkPermission("email-templates:read"),
    validatedMiddleware.validateParams(EmailTemplateIdParamSchema),
    emailTemplatesController.getById
);

router.put(
    "/:id",
    authMiddleware.checkPermission("email-templates:update"),
    validatedMiddleware.validateParams(EmailTemplateIdParamSchema),
    validatedMiddleware.validateBody(UpdateEmailTemplateBodySchema),
    emailTemplatesController.update
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("email-templates:delete"),
    validatedMiddleware.validateParams(EmailTemplateIdParamSchema),
    emailTemplatesController.delete
);

export default router;
