import type { WebsitesRepository } from "../domain/websites.repository.js";
import type { WebsiteEntity, ListWebsitesFilters } from "../domain/website.entity.js";

export class ListWebsitesUseCase {
    constructor(private readonly websitesRepository: WebsitesRepository) {}

    async execute(params: {
        page?: number;
        limit?: number;
        filters?: ListWebsitesFilters;
    }): Promise<{ data: WebsiteEntity[]; total: number }> {
        return this.websitesRepository.list(params);
    }
}
