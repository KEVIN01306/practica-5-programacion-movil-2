import type { FormFieldsRepository } from "../domain/form-fields.repository.js";
import type { FormFieldEntity } from "../domain/form-field.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class GetFormFieldUseCase {
    constructor(private readonly formFieldsRepository: FormFieldsRepository) {}

    async execute(id: string): Promise<FormFieldEntity> {
        const field = await this.formFieldsRepository.findById(id);
        if (!field) {
            throw new AppError("Form field not found", "FORM_FIELD_NOT_FOUND", 404);
        }
        return field;
    }
}
