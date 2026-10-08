import type { FieldType } from "@prisma/client";

export interface FormFieldEntity {
    id: string;
    formId: string;
    label: string;
    key: string;
    type: FieldType;
    isRequired: boolean;
    createdAt: Date;
}

export interface CreateFormFieldInput {
    formId: string;
    label: string;
    key: string;
    type: FieldType;
    isRequired?: boolean;
}

export interface UpdateFormFieldInput {
    label?: string;
    key?: string;
    type?: FieldType;
    isRequired?: boolean;
}
