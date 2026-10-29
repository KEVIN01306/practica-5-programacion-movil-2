import type { ProductsRepository } from "../domain/products.repository.js";
import type { Product, UpdateProduct } from "../domain/product.entity.js";
import type { CategoriesRepository } from "../../Categories/domain/categories.repository.js";
import AppError from "@shared/errors/AppError.js";
import { UniqueConstraintError } from "@shared/db/database/errors/UniqueConstraintError.js";

export class UpdateProductUseCase {
    constructor(
        private readonly productsRepository: ProductsRepository,
        private readonly categoriesRepository: CategoriesRepository
    ) {}

    async execute(id: string, data: UpdateProduct): Promise<Product> {
        try {
            const product = await this.productsRepository.findById(id);
            if (!product) {
                throw new AppError("Product not found", "PRODUCT_NOT_FOUND", 404);
            }

            if (data.categoryId) {
                const category = await this.categoriesRepository.findById(data.categoryId);
                if (!category) {
                    throw new AppError("Category not found", "CATEGORY_NOT_FOUND", 404);
                }
            }

            if (data.code && data.code.trim() !== product.code) {
                const existing = await this.productsRepository.findByCode(data.code.trim());
                if (existing && existing.id !== id) {
                    throw new AppError("A product with this barcode/code already exists", "PRODUCT_CODE_EXISTS", 409);
                }
            }

            if ((data.costPrice !== undefined && data.costPrice < 0) || (data.salePrice !== undefined && data.salePrice < 0)) {
                throw new AppError("Price values cannot be negative", "INVALID_PRICES", 400);
            }

            return await this.productsRepository.update(id, {
                ...data,
                ...(data.code && { code: data.code.trim() }),
                ...(data.name && { name: data.name.trim() }),
                ...(data.description !== undefined && { description: data.description?.trim() || null }),
            });
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError("A product with this barcode/code already exists", "PRODUCT_CODE_EXISTS", 409);
            }
            if (error instanceof AppError) throw error;
            throw new AppError("Error updating product", "INTERNAL_SERVER_ERROR", 500);
        }
    }
}
