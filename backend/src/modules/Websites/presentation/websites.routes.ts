import { Router } from "express";
import { websitesController } from "../websites.module.js";
import ContentTypesRoutes from "../../ContentTypes/presentation/content-types.routes.js";
import EmailTemplatesRoutes from "../../EmailTemplates/presentation/email-templates.routes.js";
import FormsRoutes from "../../Forms/presentation/forms.routes.js";
import { AuthMiddleware } from "../../../app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "../../../app/middleware/Validated.middleware.js";
import {
    CreateWebsiteBodySchema,
    UpdateWebsiteBodySchema,
    WebsiteIdParamSchema,
    ListWebsitesQuerySchema,
} from "./validators/websites.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Apply auth middleware to all website routes
router.use(authMiddleware.routeProtect);

router.post(
    "/",
    authMiddleware.checkPermission("websites:create"),
    validatedMiddleware.validateBody(CreateWebsiteBodySchema),
    websitesController.create
);

router.get(
    "/",
    authMiddleware.checkPermission("websites:read"),
    validatedMiddleware.validateQuery(ListWebsitesQuerySchema),
    websitesController.list
);

router.get(
    "/:id",
    authMiddleware.checkPermission("websites:read"),
    validatedMiddleware.validateParams(WebsiteIdParamSchema),
    websitesController.getById
);

router.put(
    "/:id",
    authMiddleware.checkPermission("websites:update"),
    validatedMiddleware.validateParams(WebsiteIdParamSchema),
    validatedMiddleware.validateBody(UpdateWebsiteBodySchema),
    websitesController.update
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("websites:delete"),
    validatedMiddleware.validateParams(WebsiteIdParamSchema),
    websitesController.delete
);

router.post(
    "/:id/regenerate-api-key",
    authMiddleware.checkPermission("websites:update"),
    validatedMiddleware.validateParams(WebsiteIdParamSchema),
    websitesController.regenerateApiKey
);

// Nested Content Types routes for a specific website
router.use("/:websiteId/content-types", ContentTypesRoutes);

// Nested Email Templates routes for a specific website
router.use("/:websiteId/email-templates", EmailTemplatesRoutes);

// Nested Forms routes for a specific website
router.use("/:websiteId/forms", FormsRoutes);

export default router;
