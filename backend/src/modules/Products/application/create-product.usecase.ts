import type { ProductsRepository } from "../domain/products.repository.js";
import type { Product, CreateProduct } from "../domain/product.entity.js";
import type { CategoriesRepository } from "../../Categories/domain/categories.repository.js";
import AppError from "@shared/errors/AppError.js";
import { UniqueConstraintError } from "@shared/db/database/errors/UniqueConstraintError.js";

export class CreateProductUseCase {
    constructor(
        private readonly productsRepository: ProductsRepository,
        private readonly categoriesRepository: CategoriesRepository
    ) {}

    async execute(data: CreateProduct): Promise<Product> {
        try {
            const category = await this.categoriesRepository.findById(data.categoryId);
            if (!category) {
                throw new AppError("Category not found", "CATEGORY_NOT_FOUND", 404);
            }

            const existingCode = await this.productsRepository.findByCode(data.code.trim());
            if (existingCode) {
                throw new AppError("A product with this barcode/code already exists", "PRODUCT_CODE_EXISTS", 409);
            }

            if (data.costPrice < 0 || data.salePrice < 0) {
                throw new AppError("Price values cannot be negative", "INVALID_PRICES", 400);
            }

            return await this.productsRepository.create({
                ...data,
                code: data.code.trim(),
                name: data.name.trim(),
                description: data.description?.trim() || null,
            });
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError("A product with this barcode/code already exists", "PRODUCT_CODE_EXISTS", 409);
            }
            if (error instanceof AppError) throw error;
            throw new AppError("Error creating product", "INTERNAL_SERVER_ERROR", 500);
        }
    }
}
