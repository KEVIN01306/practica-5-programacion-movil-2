import { z } from "zod";

export const SendOtpSchema = z.object({
    email: z.string().email("Formato de correo electrónico inválido"),
    type: z.enum(["PASSWORD_RESET", "OTP"]).default("PASSWORD_RESET").optional(),
});

export const VerifyOtpSchema = z.object({
    email: z.string().email("Formato de correo electrónico inválido"),
    code: z
        .string()
        .length(6, "El código de verificación debe tener exactamente 6 dígitos")
        .regex(/^\d{6}$/, "El código solo debe contener dígitos numéricos"),
    type: z.enum(["PASSWORD_RESET", "OTP"]).default("PASSWORD_RESET").optional(),
});

export const ResetPasswordSchema = z
    .object({
        resetToken: z.string().min(1, "El token de verificación es obligatorio"),
        currentPassword: z.string().optional(),
        newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
        confirmPassword: z.string().min(1, "Debe confirmar su nueva contraseña"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
