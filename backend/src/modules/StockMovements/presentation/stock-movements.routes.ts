import { Router } from "express";
import { stockMovementsController } from "../stock-movements.module.js";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { RegisterStockMovementSchema, ListStockMovementsQuerySchema } from "./validators/stock-movements.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// All routes require authentication (both ADMIN and OPERATOR can register and see movements)
router.use(authMiddleware.routeProtect);

router.post(
    "/",
    validatedMiddleware.validateBody(RegisterStockMovementSchema),
    stockMovementsController.register
);

router.get(
    "/",
    validatedMiddleware.validateQuery(ListStockMovementsQuerySchema),
    stockMovementsController.list
);

router.get(
    "/product/:productId",
    stockMovementsController.getByProduct
);

export default router;
