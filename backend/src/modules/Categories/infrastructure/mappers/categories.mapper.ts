import type { Category } from "../../domain/category.entity.js";

export class CategoriesMapper {
    static toDomain(raw: any): Category {
        return {
            id: raw.id,
            name: raw.name,
            description: raw.description ?? null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
    }
}
