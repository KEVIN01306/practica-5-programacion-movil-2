export type FieldTypeDto =
    | 'STRING'
    | 'TEXT'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'DATE'
    | 'JSON'
    | 'URL';

export type SubmissionStatusDto = 'PENDING' | 'PROCESSED' | 'SPAM' | 'FAILED';

export interface FormDto {
    id: string;
    websiteId: string;
    name: string;
    slug: string;
    sendEmail: boolean;
    emailFrom?: string | null;
    recipientEmails: string[] | null;
    emailTemplateId: string | null;
    emailTemplate?: {
        id: string;
        name: string;
        subject: string;
    } | null;
    fieldsCount?: number;
    submissionsCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFormDto {
    websiteId?: string;
    name: string;
    slug: string;
    sendEmail?: boolean;
    emailFrom?: string | null;
    recipientEmails?: string[] | null;
    emailTemplateId?: string | null;
}

export interface UpdateFormDto {
    name?: string;
    slug?: string;
    sendEmail?: boolean;
    emailFrom?: string | null;
    recipientEmails?: string[] | null;
    emailTemplateId?: string | null;
}

export interface FormFieldDto {
    id: string;
    formId: string;
    label: string;
    key: string;
    type: FieldTypeDto;
    isRequired: boolean;
    createdAt: string;
}

export interface CreateFormFieldDto {
    formId?: string;
    label: string;
    key: string;
    type: FieldTypeDto;
    isRequired?: boolean;
}

export interface UpdateFormFieldDto {
    label?: string;
    key?: string;
    type?: FieldTypeDto;
    isRequired?: boolean;
}

export interface FormSubmissionDto {
    id: string;
    formId: string;
    contactId: string | null;
    data: Record<string, any>;
    status: SubmissionStatusDto;
    createdAt: string;
    contact?: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
    } | null;
    form?: {
        id: string;
        name: string;
        slug: string;
        websiteId: string;
    };
}
