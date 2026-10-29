import type { Category, CreateCategory, UpdateCategory } from "./category.entity.js";

export interface CategoriesRepository {
    create(data: CreateCategory): Promise<Category>;
    update(id: string, data: UpdateCategory): Promise<Category>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Category | null>;
    findByName(name: string): Promise<Category | null>;
    findAll(): Promise<Category[]>;
}
