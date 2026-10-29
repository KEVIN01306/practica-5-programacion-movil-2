import { PrismaClient } from "@prisma/client";
import { PrismaCategoriesRepository } from "./infrastructure/prisma-categories.repository.js";
import { CreateCategoryUseCase } from "./application/create-category.usecase.js";
import { UpdateCategoryUseCase } from "./application/update-category.usecase.js";
import { GetCategoryUseCase } from "./application/get-category.usecase.js";
import { ListCategoriesUseCase } from "./application/list-categories.usecase.js";
import { DeleteCategoryUseCase } from "./application/delete-category.usecase.js";
import { CategoriesController } from "./presentation/categories.controller.js";

const prisma = new PrismaClient();

export const categoriesRepository = new PrismaCategoriesRepository(prisma);

export const createCategoryUseCase = new CreateCategoryUseCase(categoriesRepository);
export const updateCategoryUseCase = new UpdateCategoryUseCase(categoriesRepository);
export const getCategoryUseCase = new GetCategoryUseCase(categoriesRepository);
export const listCategoriesUseCase = new ListCategoriesUseCase(categoriesRepository);
export const deleteCategoryUseCase = new DeleteCategoryUseCase(categoriesRepository);

export const categoriesController = new CategoriesController(
    createCategoryUseCase,
    updateCategoryUseCase,
    getCategoryUseCase,
    listCategoriesUseCase,
    deleteCategoryUseCase
);
