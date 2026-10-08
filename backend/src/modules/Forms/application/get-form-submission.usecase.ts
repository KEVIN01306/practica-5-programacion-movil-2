import type { FormSubmissionsRepository } from "../domain/form-submissions.repository.js";
import type { FormSubmissionEntity } from "../domain/form-submission.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class GetFormSubmissionUseCase {
    constructor(private readonly formSubmissionsRepository: FormSubmissionsRepository) {}

    async execute(id: string): Promise<FormSubmissionEntity> {
        const submission = await this.formSubmissionsRepository.findById(id);
        if (!submission) {
            throw new AppError("Form submission not found", "SUBMISSION_NOT_FOUND", 404);
        }
        return submission;
    }
}
