export interface SendOtpRequestDto {
    email: string;
    type?: 'PASSWORD_RESET' | 'OTP';
}

export interface SendOtpResponseDto {
    expiresAt?: string;
}

export interface VerifyOtpRequestDto {
    email: string;
    code: string;
    type?: 'PASSWORD_RESET' | 'OTP';
}

export interface VerifyOtpResponseDto {
    verified: boolean;
    resetToken: string;
}

export interface ResetPasswordRequestDto {
    resetToken: string;
    currentPassword?: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordResponseDto {
    success: boolean;
    message: string;
}
