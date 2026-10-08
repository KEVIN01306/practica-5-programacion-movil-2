import type { FormField as PrismaFormField } from "@prisma/client";
import type { FormFieldEntity } from "../../domain/form-field.entity.js";

export class FormFieldMapper {
    static toDomain(raw: PrismaFormField): FormFieldEntity {
        return {
            id: raw.id,
            formId: raw.formId,
            label: raw.label,
            key: raw.key,
            type: raw.type,
            isRequired: raw.isRequired,
            createdAt: raw.createdAt,
        };
    }
}
