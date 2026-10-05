import { api } from '../../../../core/api/axios.instance';
import type { ChangePasswordFormValues } from '../../domain/schemas/profile.schemas';

export const changePassword = async (data: ChangePasswordFormValues): Promise<void> => {
    await api.patch('/users/me/password', data);
};
