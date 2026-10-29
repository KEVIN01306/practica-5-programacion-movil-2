import { PrismaClient } from "@prisma/client";
import { PrismaStockMovementsRepository } from "./infrastructure/prisma-stock-movements.repository.js";
import { productsRepository } from "../Products/products.module.js";
import { RegisterMovementUseCase } from "./application/register-movement.usecase.js";
import { ListMovementsUseCase } from "./application/list-movements.usecase.js";
import { GetProductMovementsUseCase } from "./application/get-product-movements.usecase.js";
import { StockMovementsController } from "./presentation/stock-movements.controller.js";

const prisma = new PrismaClient();

export const stockMovementsRepository = new PrismaStockMovementsRepository(prisma);

export const registerMovementUseCase = new RegisterMovementUseCase(stockMovementsRepository, productsRepository);
export const listMovementsUseCase = new ListMovementsUseCase(stockMovementsRepository);
export const getProductMovementsUseCase = new GetProductMovementsUseCase(stockMovementsRepository);

export const stockMovementsController = new StockMovementsController(
    registerMovementUseCase,
    listMovementsUseCase,
    getProductMovementsUseCase
);
