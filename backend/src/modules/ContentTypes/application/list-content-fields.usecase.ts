import type { ContentFieldsRepository } from "../domain/content-fields.repository.js";
import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type { ContentFieldEntity } from "../domain/content-field.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class ListContentFieldsUseCase {
    constructor(
        private readonly contentFieldsRepository: ContentFieldsRepository,
        private readonly contentTypesRepository: ContentTypesRepository
    ) {}

    async execute(contentTypeId: string): Promise<ContentFieldEntity[]> {
        const contentType = await this.contentTypesRepository.findById(contentTypeId);
        if (!contentType) {
            throw new AppError("Content Type not found", "CONTENT_TYPE_NOT_FOUND", 404);
        }

        return await this.contentFieldsRepository.listByContentType(contentTypeId);
    }
}
