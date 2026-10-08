import type { FormSubmissionsRepository } from "../domain/form-submissions.repository.js";
import type { FormsRepository } from "../domain/forms.repository.js";
import type { FormSubmissionEntity, ListFormSubmissionsFilters } from "../domain/form-submission.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class ListFormSubmissionsUseCase {
    constructor(
        private readonly formSubmissionsRepository: FormSubmissionsRepository,
        private readonly formsRepository: FormsRepository
    ) {}

    async execute(params: {
        page?: number;
        limit?: number;
        filters?: ListFormSubmissionsFilters;
    }): Promise<{ data: FormSubmissionEntity[]; total: number }> {
        if (params.filters?.formId) {
            const form = await this.formsRepository.findById(params.filters.formId);
            if (!form) {
                throw new AppError("Form not found", "FORM_NOT_FOUND", 404);
            }
        }

        return await this.formSubmissionsRepository.list(params);
    }
}
