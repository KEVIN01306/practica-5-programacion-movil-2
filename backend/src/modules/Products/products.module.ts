import { PrismaClient } from "@prisma/client";
import { PrismaProductsRepository } from "./infrastructure/prisma-products.repository.js";
import { categoriesRepository } from "../Categories/categories.module.js";
import { CreateProductUseCase } from "./application/create-product.usecase.js";
import { UpdateProductUseCase } from "./application/update-product.usecase.js";
import { GetProductUseCase } from "./application/get-product.usecase.js";
import { GetProductByCodeUseCase } from "./application/get-product-by-code.usecase.js";
import { ListProductsUseCase } from "./application/list-products.usecase.js";
import { DeleteProductUseCase } from "./application/delete-product.usecase.js";
import { GenerateProductCodeUseCase } from "./application/generate-product-code.usecase.js";
import { GetProductLabelUseCase } from "./application/get-product-label.usecase.js";
import { ProductsController } from "./presentation/products.controller.js";

const prisma = new PrismaClient();

export const productsRepository = new PrismaProductsRepository(prisma);

export const createProductUseCase = new CreateProductUseCase(productsRepository, categoriesRepository);
export const updateProductUseCase = new UpdateProductUseCase(productsRepository, categoriesRepository);
export const getProductUseCase = new GetProductUseCase(productsRepository);
export const getProductByCodeUseCase = new GetProductByCodeUseCase(productsRepository);
export const listProductsUseCase = new ListProductsUseCase(productsRepository);
export const deleteProductUseCase = new DeleteProductUseCase(productsRepository);
export const generateProductCodeUseCase = new GenerateProductCodeUseCase(productsRepository);
export const getProductLabelUseCase = new GetProductLabelUseCase(productsRepository);

export const productsController = new ProductsController(
    createProductUseCase,
    updateProductUseCase,
    getProductUseCase,
    getProductByCodeUseCase,
    listProductsUseCase,
    deleteProductUseCase,
    generateProductCodeUseCase,
    getProductLabelUseCase
);
