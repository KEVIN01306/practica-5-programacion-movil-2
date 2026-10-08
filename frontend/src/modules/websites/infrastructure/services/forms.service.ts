import { api } from '../../../../core/api/axios.instance';
import type {
    FormDto,
    CreateFormDto,
    UpdateFormDto,
    FormFieldDto,
    CreateFormFieldDto,
    UpdateFormFieldDto,
    FormSubmissionDto,
    SubmissionStatusDto,
} from '../../domain/dto/forms.dto';

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

interface PaginatedApiResponse<T> {
    status: string;
    message: string;
    data: T[];
    count: number;
    meta: {
        total: number;
        limit: number;
        offset: number;
    };
}

// ============================================================================
// Forms API
// ============================================================================

export const getFormsByWebsite = async (
    websiteId: string,
    params?: { page?: number; limit?: number; search?: string }
): Promise<{ data: FormDto[]; total: number }> => {
    const response = await api.get<PaginatedApiResponse<FormDto>>(
        `/websites/${websiteId}/forms`,
        { params }
    );
    return {
        data: response.data.data,
        total: response.data.meta?.total ?? response.data.data.length,
    };
};

export const getFormById = async (id: string): Promise<FormDto> => {
    const response = await api.get<ApiResponse<FormDto>>(`/forms/${id}`);
    return response.data.data;
};

export const createForm = async (
    websiteId: string,
    data: CreateFormDto
): Promise<FormDto> => {
    const response = await api.post<ApiResponse<FormDto>>(
        `/websites/${websiteId}/forms`,
        data
    );
    return response.data.data;
};

export const updateForm = async (
    id: string,
    data: UpdateFormDto
): Promise<FormDto> => {
    const response = await api.put<ApiResponse<FormDto>>(`/forms/${id}`, data);
    return response.data.data;
};

export const deleteForm = async (id: string): Promise<void> => {
    await api.delete(`/forms/${id}`);
};

// ============================================================================
// Form Fields API
// ============================================================================

export const getFormFieldsByForm = async (formId: string): Promise<FormFieldDto[]> => {
    const response = await api.get<ApiResponse<FormFieldDto[]>>(`/forms/${formId}/fields`);
    return response.data.data;
};

export const getFormFieldById = async (id: string): Promise<FormFieldDto> => {
    const response = await api.get<ApiResponse<FormFieldDto>>(`/form-fields/${id}`);
    return response.data.data;
};

export const createFormField = async (
    formId: string,
    data: CreateFormFieldDto
): Promise<FormFieldDto> => {
    const response = await api.post<ApiResponse<FormFieldDto>>(`/forms/${formId}/fields`, data);
    return response.data.data;
};

export const bulkCreateFormFields = async (
    formId: string,
    fields: CreateFormFieldDto[]
): Promise<FormFieldDto[]> => {
    const response = await api.post<ApiResponse<FormFieldDto[]>>(
        `/forms/${formId}/fields/bulk`,
        { fields }
    );
    return response.data.data;
};

export const updateFormField = async (
    id: string,
    data: UpdateFormFieldDto
): Promise<FormFieldDto> => {
    const response = await api.put<ApiResponse<FormFieldDto>>(`/form-fields/${id}`, data);
    return response.data.data;
};

export const deleteFormField = async (id: string): Promise<void> => {
    await api.delete(`/form-fields/${id}`);
};

// ============================================================================
// Form Submissions API
// ============================================================================

export const getFormSubmissions = async (
    formId: string,
    params?: { page?: number; limit?: number; status?: SubmissionStatusDto; search?: string }
): Promise<{ data: FormSubmissionDto[]; total: number }> => {
    const response = await api.get<PaginatedApiResponse<FormSubmissionDto>>(
        `/forms/${formId}/submissions`,
        { params }
    );
    return {
        data: response.data.data,
        total: response.data.meta?.total ?? response.data.data.length,
    };
};

export const getFormSubmissionById = async (id: string): Promise<FormSubmissionDto> => {
    const response = await api.get<ApiResponse<FormSubmissionDto>>(`/form-submissions/${id}`);
    return response.data.data;
};

export const updateFormSubmissionStatus = async (
    id: string,
    status: SubmissionStatusDto
): Promise<FormSubmissionDto> => {
    const response = await api.patch<ApiResponse<FormSubmissionDto>>(
        `/form-submissions/${id}/status`,
        { status }
    );
    return response.data.data;
};

export const deleteFormSubmission = async (id: string): Promise<void> => {
    await api.delete(`/form-submissions/${id}`);
};
