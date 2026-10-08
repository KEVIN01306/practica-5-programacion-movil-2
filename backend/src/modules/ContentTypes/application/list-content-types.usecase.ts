import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type { WebsitesRepository } from "../../Websites/domain/websites.repository.js";
import type { ContentTypeEntity, ListContentTypesFilters } from "../domain/content-type.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class ListContentTypesUseCase {
    constructor(
        private readonly contentTypesRepository: ContentTypesRepository,
        private readonly websitesRepository: WebsitesRepository
    ) {}

    async execute(params: {
        page?: number;
        limit?: number;
        filters?: ListContentTypesFilters;
    }): Promise<{ data: ContentTypeEntity[]; total: number }> {
        if (params.filters?.websiteId) {
            const website = await this.websitesRepository.findById(params.filters.websiteId);
            if (!website) {
                throw new AppError("Website not found", "WEBSITE_NOT_FOUND", 404);
            }
        }

        return await this.contentTypesRepository.list(params);
    }
}
