import type { ContentItem } from "@prisma/client";
import type { ContentItemEntity } from "../../domain/content-item.entity.js";

export class ContentItemMapper {
    static toDomain(raw: ContentItem): ContentItemEntity {
        return {
            id: raw.id,
            contentTypeId: raw.contentTypeId,
            data: (raw.data as Record<string, any>) ?? {},
            isPublished: raw.isPublished,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
    }
}
