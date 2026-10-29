import type { ProductsRepository } from "../domain/products.repository.js";
import type { Product, ProductFilters } from "../domain/product.entity.js";

export class ListProductsUseCase {
    constructor(private readonly productsRepository: ProductsRepository) {}

    async execute(filters: ProductFilters): Promise<{ data: Product[]; total: number }> {
        return await this.productsRepository.findAllPaginated(filters);
    }
}
