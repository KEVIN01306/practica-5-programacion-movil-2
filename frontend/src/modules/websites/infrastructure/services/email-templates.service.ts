import { api } from '../../../../core/api/axios.instance';
import type {
    EmailTemplateDto,
    CreateEmailTemplateDto,
    UpdateEmailTemplateDto,
} from '../../domain/dto/email-templates.dto';

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

/**
 * Fetch all email templates for a website (with pagination & search support)
 */
export const getEmailTemplatesByWebsite = async (
    websiteId: string,
    params?: { page?: number; limit?: number; search?: string }
): Promise<{ data: EmailTemplateDto[]; total: number }> => {
    const response = await api.get<PaginatedApiResponse<EmailTemplateDto>>(
        `/websites/${websiteId}/email-templates`,
        { params }
    );
    return {
        data: response.data.data,
        total: response.data.meta?.total ?? response.data.data.length,
    };
};

/**
 * Get a single email template by ID
 */
export const getEmailTemplateById = async (id: string): Promise<EmailTemplateDto> => {
    const response = await api.get<ApiResponse<EmailTemplateDto>>(`/email-templates/${id}`);
    return response.data.data;
};

/**
 * Create a new email template under a website
 */
export const createEmailTemplate = async (
    websiteId: string,
    data: CreateEmailTemplateDto
): Promise<EmailTemplateDto> => {
    const response = await api.post<ApiResponse<EmailTemplateDto>>(
        `/websites/${websiteId}/email-templates`,
        data
    );
    return response.data.data;
};

/**
 * Update an existing email template
 */
export const updateEmailTemplate = async (
    id: string,
    data: UpdateEmailTemplateDto
): Promise<EmailTemplateDto> => {
    const response = await api.put<ApiResponse<EmailTemplateDto>>(`/email-templates/${id}`, data);
    return response.data.data;
};

/**
 * Delete an email template
 */
export const deleteEmailTemplate = async (id: string): Promise<void> => {
    await api.delete(`/email-templates/${id}`);
};
