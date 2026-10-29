import { Router } from "express";
import { productsController } from "../products.module.js";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import {
    CreateProductSchema,
    UpdateProductSchema,
    ProductIdSchema,
    ProductCodeSchema,
    ListProductsQuerySchema,
} from "./validators/products.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// All routes require authentication
router.use(authMiddleware.routeProtect);

router.get(
    "/",
    validatedMiddleware.validateQuery(ListProductsQuerySchema),
    productsController.list
);

router.get(
    "/generate-code",
    productsController.generateCode
);

router.get(
    "/code/:code",
    validatedMiddleware.validateParams(ProductCodeSchema),
    productsController.getByCode
);

router.get(
    "/:id/label",
    validatedMiddleware.validateParams(ProductIdSchema),
    productsController.getLabel
);

router.get(
    "/:id",
    validatedMiddleware.validateParams(ProductIdSchema),
    productsController.getById
);

router.post(
    "/",
    authMiddleware.checkRole(["ADMIN"]),
    validatedMiddleware.validateBody(CreateProductSchema),
    productsController.create
);

router.put(
    "/:id",
    authMiddleware.checkRole(["ADMIN"]),
    validatedMiddleware.validateParams(ProductIdSchema),
    validatedMiddleware.validateBody(UpdateProductSchema),
    productsController.update
);

router.delete(
    "/:id",
    authMiddleware.checkRole(["ADMIN"]),
    validatedMiddleware.validateParams(ProductIdSchema),
    productsController.delete
);

export default router;
