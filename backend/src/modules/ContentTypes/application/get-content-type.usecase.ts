import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type { ContentTypeEntity } from "../domain/content-type.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class GetContentTypeUseCase {
    constructor(private readonly contentTypesRepository: ContentTypesRepository) {}

    async execute(id: string): Promise<ContentTypeEntity> {
        const contentType = await this.contentTypesRepository.findById(id);
        if (!contentType) {
            throw new AppError("Content Type not found", "CONTENT_TYPE_NOT_FOUND", 404);
        }
        return contentType;
    }
}
