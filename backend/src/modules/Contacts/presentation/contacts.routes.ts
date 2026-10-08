import { Router } from "express";
import { contactsController } from "../contacts.module.js";
import { AuthMiddleware } from "../../../app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "../../../app/middleware/Validated.middleware.js";
import {
    CreateContactBodySchema,
    UpdateContactBodySchema,
    ContactIdParamSchema,
    ListContactsQuerySchema,
} from "./validators/contacts.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.routeProtect);

router.get(
    "/",
    authMiddleware.checkPermission("contacts:read"),
    validatedMiddleware.validateQuery(ListContactsQuerySchema),
    contactsController.list
);

router.get(
    "/:id",
    authMiddleware.checkPermission("contacts:read"),
    validatedMiddleware.validateParams(ContactIdParamSchema),
    contactsController.getById
);

router.post(
    "/",
    authMiddleware.checkPermission("contacts:create"),
    validatedMiddleware.validateBody(CreateContactBodySchema),
    contactsController.create
);

router.put(
    "/:id",
    authMiddleware.checkPermission("contacts:update"),
    validatedMiddleware.validateParams(ContactIdParamSchema),
    validatedMiddleware.validateBody(UpdateContactBodySchema),
    contactsController.update
);

router.delete(
    "/:id",
    authMiddleware.checkPermission("contacts:delete"),
    validatedMiddleware.validateParams(ContactIdParamSchema),
    contactsController.delete
);

export default router;
