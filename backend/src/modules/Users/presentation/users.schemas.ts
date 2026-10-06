import { z } from "zod";

export const ALLOWED_USER_EMAIL_DOMAINS = ["pharmadel.com", "cadimportinc.com", "gmail.com"] as const;

export const isValidUserEmailDomain = (email?: string | null): boolean => {
    if (!email || typeof email !== "string") return false;
    const parts = email.trim().toLowerCase().split("@");
    if (parts.length !== 2) return false;
    const domain = parts[1] ? parts[1] : "";
    return (ALLOWED_USER_EMAIL_DOMAINS as readonly string[]).includes(domain);
};

export const CreateUserSchema = z
    .object({
        email: z
            .string()
            .email("Invalid email format")
            .refine(isValidUserEmailDomain, {
                message: "Dominio inválido para este usuario. Solo se permiten correos @pharmadel.com o @cadimportinc.com.",
            }),
        passwordRaw: z.string().min(8, "Password must be at least 8 characters long").optional(),
        autoGeneratePassword: z.boolean().optional(),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        roles: z.array(z.string()).min(1, "At least one role is required").default(["USER"]),
    })
    .refine((data) => data.autoGeneratePassword || (data.passwordRaw && data.passwordRaw.length >= 8), {
        message: "Debe ingresar una contraseña de al menos 8 caracteres o seleccionar 'Generar contraseña automáticamente'",
        path: ["passwordRaw"],
    });

export const UpdateUserSchema = z.object({
    email: z
        .string()
        .email("Invalid email format")
        .refine(isValidUserEmailDomain, {
            message: "Dominio inválido para este usuario. Solo se permiten correos @pharmadel.com o @cadimportinc.com.",
        })
        .optional(),
    passwordRaw: z.string().min(8, "Password must be at least 8 characters long").optional(),
    firstName: z.string().min(1, "First name must not be empty").optional(),
    lastName: z.string().min(1, "Last name must not be empty").optional(),
    roles: z.array(z.string()).optional()
});

export const UserIdSchema = z.object({
    id: z.string().uuid("Invalid user ID format")
});

export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});
