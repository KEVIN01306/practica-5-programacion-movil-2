import type { CategoriesRepository } from "../domain/categories.repository.js";
import type { Category, UpdateCategory } from "../domain/category.entity.js";
import AppError from "@shared/errors/AppError.js";
import { UniqueConstraintError } from "@shared/db/database/errors/UniqueConstraintError.js";

export class UpdateCategoryUseCase {
    constructor(private readonly categoriesRepository: CategoriesRepository) {}

    async execute(id: string, data: UpdateCategory): Promise<Category> {
        try {
            const existing = await this.categoriesRepository.findById(id);
            if (!existing) {
                throw new AppError("Category not found", "CATEGORY_NOT_FOUND", 404);
            }

            if (data.name) {
                const trimmedName = data.name.trim();
                const duplicate = await this.categoriesRepository.findByName(trimmedName);
                if (duplicate && duplicate.id !== id) {
                    throw new AppError("A category with this name already exists", "CATEGORY_ALREADY_EXISTS", 409);
                }
            }

            return await this.categoriesRepository.update(id, {
                ...(data.name && { name: data.name.trim() }),
                ...(data.description !== undefined && { description: data.description?.trim() || null }),
            });
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError("A category with this name already exists", "CATEGORY_ALREADY_EXISTS", 409);
            }
            if (error instanceof AppError) throw error;
            throw new AppError("Error updating category", "INTERNAL_SERVER_ERROR", 500);
        }
    }
}
