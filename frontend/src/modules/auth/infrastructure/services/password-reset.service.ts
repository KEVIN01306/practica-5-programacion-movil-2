import axios from 'axios';
import { API_BASE_URL } from '../../../../core/api/config';
import type {
    SendOtpRequestDto,
    SendOtpResponseDto,
    VerifyOtpRequestDto,
    VerifyOtpResponseDto,
    ResetPasswordRequestDto,
    ResetPasswordResponseDto,
} from '../../domain/dto/password-reset.dto';

const AUTH_BASE_URL = `${API_BASE_URL}/auth`;

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

/**
 * Sends a 6-digit OTP code to the provided email address for password reset.
 */
export const sendOtp = async (data: SendOtpRequestDto): Promise<SendOtpResponseDto> => {
    const response = await axios.post<ApiResponse<SendOtpResponseDto>>(
        `${AUTH_BASE_URL}/otp/send`,
        {
            email: data.email,
            type: data.type || 'PASSWORD_RESET',
        },
        { withCredentials: true }
    );
    return response.data.data;
};

/**
 * Verifies the 6-digit OTP code against the server and receives a single-use reset token.
 */
export const verifyOtp = async (data: VerifyOtpRequestDto): Promise<VerifyOtpResponseDto> => {
    const response = await axios.post<ApiResponse<VerifyOtpResponseDto>>(
        `${AUTH_BASE_URL}/otp/verify`,
        {
            email: data.email,
            code: data.code,
            type: data.type || 'PASSWORD_RESET',
        },
        { withCredentials: true }
    );
    return response.data.data;
};

/**
 * Submits the new password using the verified single-use reset token.
 */
export const resetPassword = async (data: ResetPasswordRequestDto): Promise<ResetPasswordResponseDto> => {
    const response = await axios.post<ApiResponse<null>>(
        `${AUTH_BASE_URL}/reset-password`,
        data,
        { withCredentials: true }
    );
    return {
        success: true,
        message: response.data.message || 'Contraseña actualizada exitosamente',
    };
};
