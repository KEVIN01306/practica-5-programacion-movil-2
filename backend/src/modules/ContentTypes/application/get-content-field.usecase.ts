import type { ContentFieldsRepository } from "../domain/content-fields.repository.js";
import type { ContentFieldEntity } from "../domain/content-field.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class GetContentFieldUseCase {
    constructor(private readonly contentFieldsRepository: ContentFieldsRepository) {}

    async execute(id: string): Promise<ContentFieldEntity> {
        const field = await this.contentFieldsRepository.findById(id);
        if (!field) {
            throw new AppError("Content Field not found", "CONTENT_FIELD_NOT_FOUND", 404);
        }
        return field;
    }
}
