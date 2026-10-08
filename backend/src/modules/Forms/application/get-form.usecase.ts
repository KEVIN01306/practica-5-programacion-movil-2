import type { FormsRepository } from "../domain/forms.repository.js";
import type { FormEntity } from "../domain/form.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class GetFormUseCase {
    constructor(private readonly formsRepository: FormsRepository) {}

    async execute(id: string): Promise<FormEntity> {
        const form = await this.formsRepository.findById(id);
        if (!form) {
            throw new AppError("Form not found", "FORM_NOT_FOUND", 404);
        }
        return form;
    }
}
