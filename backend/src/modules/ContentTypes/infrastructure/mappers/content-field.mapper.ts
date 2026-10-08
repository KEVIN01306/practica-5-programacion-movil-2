import type { ContentField } from "@prisma/client";
import type { ContentFieldEntity, FieldType } from "../../domain/content-field.entity.js";

export class ContentFieldMapper {
    static toDomain(raw: ContentField): ContentFieldEntity {
        return {
            id: raw.id,
            contentTypeId: raw.contentTypeId,
            name: raw.name,
            key: raw.key,
            type: raw.type as FieldType,
            isRequired: raw.isRequired,
            createdAt: raw.createdAt,
        };
    }
}
