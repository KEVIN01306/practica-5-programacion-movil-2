import type { FormFieldsRepository } from "../domain/form-fields.repository.js";
import type { FormsRepository } from "../domain/forms.repository.js";
import type { FormFieldEntity } from "../domain/form-field.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class ListFormFieldsUseCase {
    constructor(
        private readonly formFieldsRepository: FormFieldsRepository,
        private readonly formsRepository: FormsRepository
    ) {}

    async execute(formId: string): Promise<FormFieldEntity[]> {
        const form = await this.formsRepository.findById(formId);
        if (!form) {
            throw new AppError("Form not found", "FORM_NOT_FOUND", 404);
        }
        return await this.formFieldsRepository.listByFormId(formId);
    }
}
