import { Router } from "express";
import { ErrorMiddleware } from "../app/middleware/Error.middleware.js";
import AuthRoutes from "../modules/Auth/presentation/auth.routes.js";
import UsersRoutes from "../modules/Users/presentation/users.routes.js";
import CategoriesRoutes from "../modules/Categories/presentation/categories.routes.js";
import ProductsRoutes from "../modules/Products/presentation/products.routes.js";
import StockMovementsRoutes from "../modules/StockMovements/presentation/stock-movements.routes.js";

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/users', UsersRoutes);
router.use('/categories', CategoriesRoutes);
router.use('/products', ProductsRoutes);
router.use('/stock-movements', StockMovementsRoutes);

router.use(ErrorMiddleware);

export default router;
