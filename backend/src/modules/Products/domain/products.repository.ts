import type { Product, CreateProduct, UpdateProduct, ProductFilters } from "./product.entity.js";

export interface ProductsRepository {
    create(data: CreateProduct): Promise<Product>;
    update(id: string, data: UpdateProduct): Promise<Product>;
    softDelete(id: string): Promise<Product>;
    findById(id: string): Promise<Product | null>;
    findByCode(code: string): Promise<Product | null>;
    findAllPaginated(filters: ProductFilters): Promise<{ data: Product[]; total: number }>;
}
