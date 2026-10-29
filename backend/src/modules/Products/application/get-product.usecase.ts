import type { ProductsRepository } from "../domain/products.repository.js";
import type { Product } from "../domain/product.entity.js";
import AppError from "@shared/errors/AppError.js";

export class GetProductUseCase {
    constructor(private readonly productsRepository: ProductsRepository) {}

    async execute(id: string): Promise<Product> {
        const product = await this.productsRepository.findById(id);
        if (!product || !product.isActive) {
            throw new AppError("Product not found", "PRODUCT_NOT_FOUND", 404);
        }
        return product;
    }
}
