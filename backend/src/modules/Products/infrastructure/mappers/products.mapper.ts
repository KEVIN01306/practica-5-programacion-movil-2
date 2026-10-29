import type { Product } from "../../domain/product.entity.js";

export class ProductsMapper {
    static toDomain(raw: any): Product {
        return {
            id: raw.id,
            code: raw.code,
            name: raw.name,
            description: raw.description ?? null,
            costPrice: typeof raw.costPrice?.toNumber === "function" ? raw.costPrice.toNumber() : Number(raw.costPrice),
            salePrice: typeof raw.salePrice?.toNumber === "function" ? raw.salePrice.toNumber() : Number(raw.salePrice),
            currentStock: raw.currentStock,
            minStock: raw.minStock,
            imageUrl: raw.imageUrl ?? null,
            isActive: raw.isActive,
            categoryId: raw.categoryId,
            categoryName: raw.category?.name,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
    }
}
