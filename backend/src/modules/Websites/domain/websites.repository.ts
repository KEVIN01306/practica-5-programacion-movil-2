import type {
    WebsiteEntity,
    CreateWebsiteInput,
    UpdateWebsiteInput,
    ListWebsitesFilters,
} from "./website.entity.js";

export interface WebsitesRepository {
    create(data: CreateWebsiteInput): Promise<WebsiteEntity>;
    findById(id: string): Promise<WebsiteEntity | null>;
    findByDomain(domain: string): Promise<WebsiteEntity | null>;
    findByApiKey(apiKey: string): Promise<WebsiteEntity | null>;
    list(params: {
        page?: number;
        limit?: number;
        filters?: ListWebsitesFilters;
    }): Promise<{ data: WebsiteEntity[]; total: number }>;
    update(id: string, data: UpdateWebsiteInput): Promise<WebsiteEntity>;
    delete(id: string): Promise<void>;
    regenerateApiKey(id: string, newApiKey: string): Promise<WebsiteEntity>;
}
