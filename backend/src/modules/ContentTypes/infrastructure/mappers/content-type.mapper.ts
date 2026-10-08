import type { ContentType } from "@prisma/client";
import type { ContentTypeEntity } from "../../domain/content-type.entity.js";

type PrismaContentTypeWithCount = ContentType & {
    _count?: {
        fields?: number;
        items?: number;
    };
};

export class ContentTypeMapper {
    static toDomain(raw: PrismaContentTypeWithCount): ContentTypeEntity {
        return {
            id: raw.id,
            websiteId: raw.websiteId,
            name: raw.name,
            slug: raw.slug,
            description: raw.description,
            fieldsCount: raw._count?.fields ?? 0,
            itemsCount: raw._count?.items ?? 0,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
    }
}
