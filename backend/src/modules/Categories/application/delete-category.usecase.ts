import type { CategoriesRepository } from "../domain/categories.repository.js";
import AppError from "@shared/errors/AppError.js";

export class DeleteCategoryUseCase {
    constructor(private readonly categoriesRepository: CategoriesRepository) {}

    async execute(id: string): Promise<void> {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new AppError("Category not found", "CATEGORY_NOT_FOUND", 404);
        }
        await this.categoriesRepository.delete(id);
    }
}
