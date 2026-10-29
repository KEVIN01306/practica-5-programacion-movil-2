import type { CategoriesRepository } from "../domain/categories.repository.js";
import type { Category, CreateCategory } from "../domain/category.entity.js";
import AppError from "@shared/errors/AppError.js";
import { UniqueConstraintError } from "@shared/db/database/errors/UniqueConstraintError.js";

export class CreateCategoryUseCase {
    constructor(private readonly categoriesRepository: CategoriesRepository) {}

    async execute(data: CreateCategory): Promise<Category> {
        try {
            const trimmedName = data.name.trim();
            if (!trimmedName) {
                throw new AppError("Category name is required", "INVALID_DATA", 400);
            }

            const existing = await this.categoriesRepository.findByName(trimmedName);
            if (existing) {
                throw new AppError("A category with this name already exists", "CATEGORY_ALREADY_EXISTS", 409);
            }

            return await this.categoriesRepository.create({
                name: trimmedName,
                description: data.description?.trim() || null,
            });
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError("A category with this name already exists", "CATEGORY_ALREADY_EXISTS", 409);
            }
            if (error instanceof AppError) throw error;
            throw new AppError("Error creating category", "INTERNAL_SERVER_ERROR", 500);
        }
    }
}
