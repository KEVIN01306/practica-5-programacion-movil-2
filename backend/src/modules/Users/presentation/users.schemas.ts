import { z } from "zod";

export const CreateUserSchema = z
    .object({
        email: z.string().email("Invalid email format"),
        passwordRaw: z.string().min(8, "Password must be at least 8 characters long").optional(),
        autoGeneratePassword: z.boolean().optional(),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        role: z.enum(["ADMIN", "OPERATOR"]).default("OPERATOR"),
        roles: z.array(z.string()).optional(),
    })
    .refine((data) => data.autoGeneratePassword || (data.passwordRaw && data.passwordRaw.length >= 8), {
        message: "Debe ingresar una contraseña de al menos 8 caracteres o seleccionar 'Generar contraseña automáticamente'",
        path: ["passwordRaw"],
    });

export const UpdateUserSchema = z.object({
    email: z.string().email("Invalid email format").optional(),
    passwordRaw: z.string().min(8, "Password must be at least 8 characters long").optional(),
    firstName: z.string().min(1, "First name must not be empty").optional(),
    lastName: z.string().min(1, "Last name must not be empty").optional(),
    role: z.enum(["ADMIN", "OPERATOR"]).optional(),
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
