import { api } from '../../../../core/api/axios.instance';
import type {
    ContactDto,
    CreateContactDto,
    UpdateContactDto,
    ListContactsParamsDto,
    ContactsListResponseDto,
} from '../../domain/dto/contacts.dto';

const BASE_URL = '/contacts';

export const getContacts = async (
    params?: ListContactsParamsDto
): Promise<ContactsListResponseDto> => {
    const response = await api.get<ContactsListResponseDto>(BASE_URL, {
        params,
    });
    return response.data;
};

export const getContactById = async (id: string): Promise<ContactDto> => {
    const response = await api.get<ContactDto>(`${BASE_URL}/${id}`);
    return response.data;
};

export const createContact = async (data: CreateContactDto): Promise<ContactDto> => {
    const response = await api.post<ContactDto>(BASE_URL, data);
    return response.data;
};

export const updateContact = async (
    id: string,
    data: UpdateContactDto
): Promise<ContactDto> => {
    const response = await api.put<ContactDto>(`${BASE_URL}/${id}`, data);
    return response.data;
};

export const deleteContact = async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
};
