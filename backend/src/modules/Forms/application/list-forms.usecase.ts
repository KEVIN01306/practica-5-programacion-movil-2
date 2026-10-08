import type { FormsRepository } from "../domain/forms.repository.js";
import type { WebsitesRepository } from "../../Websites/domain/websites.repository.js";
import type { FormEntity, ListFormsFilters } from "../domain/form.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class ListFormsUseCase {
    constructor(
        private readonly formsRepository: FormsRepository,
        private readonly websitesRepository: WebsitesRepository
    ) {}

    async execute(params: {
        page?: number;
        limit?: number;
        filters?: ListFormsFilters;
    }): Promise<{ data: FormEntity[]; total: number }> {
        if (params.filters?.websiteId) {
            const website = await this.websitesRepository.findById(params.filters.websiteId);
            if (!website) {
                throw new AppError("Website not found", "WEBSITE_NOT_FOUND", 404);
            }
        }

        return await this.formsRepository.list(params);
    }
}
