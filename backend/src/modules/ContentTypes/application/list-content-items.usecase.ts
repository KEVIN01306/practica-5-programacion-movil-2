import type { ContentItemsRepository } from "../domain/content-items.repository.js";
import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type { ContentItemEntity, ListContentItemsFilters } from "../domain/content-item.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class ListContentItemsUseCase {
    constructor(
        private readonly contentItemsRepository: ContentItemsRepository,
        private readonly contentTypesRepository: ContentTypesRepository
    ) {}

    async execute(params: {
        page?: number;
        limit?: number;
        filters?: ListContentItemsFilters;
    }): Promise<{ data: ContentItemEntity[]; total: number }> {
        if (params.filters?.contentTypeId) {
            const contentType = await this.contentTypesRepository.findById(params.filters.contentTypeId);
            if (!contentType) {
                throw new AppError("Content Type not found", "CONTENT_TYPE_NOT_FOUND", 404);
            }
        }

        return await this.contentItemsRepository.list(params);
    }
}
