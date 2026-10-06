import { z } from "zod";
export declare const SendOtpSchema: z.ZodObject<{
    email: z.ZodString;
    type: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        PASSWORD_RESET: "PASSWORD_RESET";
        OTP: "OTP";
    }>>>;
}, z.core.$strip>;
export declare const VerifyOtpSchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
    type: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        PASSWORD_RESET: "PASSWORD_RESET";
        OTP: "OTP";
    }>>>;
}, z.core.$strip>;
export declare const ResetPasswordSchema: z.ZodObject<{
    resetToken: z.ZodString;
    currentPassword: z.ZodOptional<z.ZodString>;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
//# sourceMappingURL=otp.schemas.d.ts.map