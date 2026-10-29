import type { CategoriesRepository } from "../domain/categories.repository.js";
import type { Category } from "../domain/category.entity.js";
import AppError from "@shared/errors/AppError.js";

export class GetCategoryUseCase {
    constructor(private readonly categoriesRepository: CategoriesRepository) {}

    async execute(id: string): Promise<Category> {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new AppError("Category not found", "CATEGORY_NOT_FOUND", 404);
        }
        return category;
    }
}
