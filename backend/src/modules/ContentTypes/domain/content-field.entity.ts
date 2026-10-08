export type FieldType =
    | 'STRING'
    | 'TEXT'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'DATE'
    | 'JSON'
    | 'URL';

export interface ContentFieldEntity {
    id: string;
    contentTypeId: string;
    name: string;
    key: string;
    type: FieldType;
    isRequired: boolean;
    createdAt: Date;
}

export interface CreateContentFieldInput {
    contentTypeId: string;
    name: string;
    key: string;
    type: FieldType;
    isRequired?: boolean;
}

export interface UpdateContentFieldInput {
    name?: string;
    key?: string;
    type?: FieldType;
    isRequired?: boolean;
}
