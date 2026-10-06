import type { OtpProvider, SendOtpResult, VerifyOtpResult } from "../domain/otp.provider.js";
export declare class HttpOtpProvider implements OtpProvider {
    private readonly baseUrl;
    private readonly apiKey;
    constructor(baseUrl?: string, apiKey?: string);
    sendOtp(email: string, type?: 'PASSWORD_RESET' | 'OTP'): Promise<SendOtpResult>;
    verifyOtp(email: string, code: string, type?: 'PASSWORD_RESET' | 'OTP'): Promise<VerifyOtpResult>;
}
//# sourceMappingURL=http-otp.provider.d.ts.map