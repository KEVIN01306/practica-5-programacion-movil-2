import type { WebsitesRepository } from "../domain/websites.repository.js";
import type { WebsiteEntity } from "../domain/website.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class GetWebsiteUseCase {
    constructor(private readonly websitesRepository: WebsitesRepository) {}

    async execute(id: string): Promise<WebsiteEntity> {
        const website = await this.websitesRepository.findById(id);
        if (!website) {
            throw new AppError("Website not found", "WEBSITE_NOT_FOUND", 404);
        }
        return website;
    }
}
