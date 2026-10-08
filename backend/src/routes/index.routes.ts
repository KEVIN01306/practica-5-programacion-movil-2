import { Router } from "express";
import { ErrorMiddleware } from "../app/middleware/Error.middleware.js";
import AuthRoutes from "../modules/Auth/presentation/auth.routes.js";
import UsersRoutes from "../modules/Users/presentation/users.routes.js";
import AuditRoutes from "../modules/Audit/presentation/audit.routes.js";
import RolesRoutes from "../modules/Roles/presentation/roles.routes.js";
import PermissionsRoutes from "../modules/Roles/presentation/permissions.routes.js";
import WebsitesRoutes from "../modules/Websites/presentation/websites.routes.js";
import ContentTypesRoutes from "../modules/ContentTypes/presentation/content-types.routes.js";
import ContentFieldsRoutes from "../modules/ContentTypes/presentation/content-fields.routes.js";
import ContentItemsRoutes from "../modules/ContentTypes/presentation/content-items.routes.js";
import EmailTemplatesRoutes from "../modules/EmailTemplates/presentation/email-templates.routes.js";
import FormsRoutes from "../modules/Forms/presentation/forms.routes.js";
import FormFieldsRoutes from "../modules/Forms/presentation/form-fields.routes.js";
import FormSubmissionsRoutes from "../modules/Forms/presentation/form-submissions.routes.js";
import EmailRoutes from "../modules/Email/presentation/email.routes.js";
import ContactsRoutes from "../modules/Contacts/presentation/contacts.routes.js";
//import HeadlessContentRoutes from "../modules/ContentTypes/presentation/headless-content.routes.js";

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/users', UsersRoutes);
router.use('/audit', AuditRoutes);
router.use('/audit-logs', AuditRoutes);
router.use('/roles', RolesRoutes);
router.use('/permissions', PermissionsRoutes);
router.use('/websites', WebsitesRoutes);
router.use('/content-types', ContentTypesRoutes);
router.use('/content-fields', ContentFieldsRoutes);
router.use('/content-items', ContentItemsRoutes);
router.use('/email-templates', EmailTemplatesRoutes);
router.use('/forms', FormsRoutes);
router.use('/form-fields', FormFieldsRoutes);
router.use('/form-submissions', FormSubmissionsRoutes);
router.use('/contacts', ContactsRoutes);
router.use('/emails', EmailRoutes);
//router.use('/content', HeadlessContentRoutes);

router.use(ErrorMiddleware);

export default router;
