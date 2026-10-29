import type { CategoriesRepository } from "../domain/categories.repository.js";
import type { Category } from "../domain/category.entity.js";

export class ListCategoriesUseCase {
    constructor(private readonly categoriesRepository: CategoriesRepository) {}

    async execute(): Promise<Category[]> {
        return await this.categoriesRepository.findAll();
    }
}
