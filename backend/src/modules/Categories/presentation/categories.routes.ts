import { Router } from "express";
import { categoriesController } from "../categories.module.js";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { CreateCategorySchema, UpdateCategorySchema, CategoryIdSchema } from "./validators/categories.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// All routes require authentication
router.use(authMiddleware.routeProtect);

router.get("/", categoriesController.list);

router.get(
    "/:id",
    validatedMiddleware.validateParams(CategoryIdSchema),
    categoriesController.getById
);

router.post(
    "/",
    authMiddleware.checkRole(["ADMIN", "OPERATOR"]),
    validatedMiddleware.validateBody(CreateCategorySchema),
    categoriesController.create
);

router.put(
    "/:id",
    authMiddleware.checkRole(["ADMIN"]),
    validatedMiddleware.validateParams(CategoryIdSchema),
    validatedMiddleware.validateBody(UpdateCategorySchema),
    categoriesController.update
);

router.delete(
    "/:id",
    authMiddleware.checkRole(["ADMIN"]),
    validatedMiddleware.validateParams(CategoryIdSchema),
    categoriesController.delete
);

export default router;
