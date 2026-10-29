import type { ProductsRepository } from "../domain/products.repository.js";
import type { Product } from "../domain/product.entity.js";
import AppError from "@shared/errors/AppError.js";

export class GetProductByCodeUseCase {
    constructor(private readonly productsRepository: ProductsRepository) {}

    async execute(code: string): Promise<Product> {
        const product = await this.productsRepository.findByCode(code.trim());
        if (!product || !product.isActive) {
            throw new AppError("Product with given barcode/code not found", "PRODUCT_NOT_FOUND", 404);
        }
        return product;
    }
}
