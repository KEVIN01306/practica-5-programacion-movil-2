export interface SendOtpResult {
    success: boolean;
    message: string;
    expiresAt?: string;
}

export interface VerifyOtpResult {
    success: boolean;
    verified: boolean;
    message: string;
}

export interface OtpProvider {
    sendOtp(email: string, type?: 'PASSWORD_RESET' | 'OTP'): Promise<SendOtpResult>;
    verifyOtp(email: string, code: string, type?: 'PASSWORD_RESET' | 'OTP'): Promise<VerifyOtpResult>;
}
