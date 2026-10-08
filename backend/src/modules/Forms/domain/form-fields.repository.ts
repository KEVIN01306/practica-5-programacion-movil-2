import type {
    FormFieldEntity,
    CreateFormFieldInput,
    UpdateFormFieldInput,
} from "./form-field.entity.js";

export interface FormFieldsRepository {
    create(data: CreateFormFieldInput): Promise<FormFieldEntity>;
    findById(id: string): Promise<FormFieldEntity | null>;
    findByKey(formId: string, key: string): Promise<FormFieldEntity | null>;
    listByFormId(formId: string): Promise<FormFieldEntity[]>;
    update(id: string, data: UpdateFormFieldInput): Promise<FormFieldEntity>;
    delete(id: string): Promise<void>;
    bulkCreate(formId: string, fields: Omit<CreateFormFieldInput, "formId">[]): Promise<FormFieldEntity[]>;
}
