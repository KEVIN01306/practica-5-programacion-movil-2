import { z } from "zod";
export declare const ALLOWED_USER_EMAIL_DOMAINS: readonly ["pharmadel.com", "cadimportinc.com", "gmail.com"];
export declare const isValidUserEmailDomain: (email?: string | null) => boolean;
export declare const CreateUserSchema: z.ZodObject<{
    email: z.ZodString;
    passwordRaw: z.ZodOptional<z.ZodString>;
    autoGeneratePassword: z.ZodOptional<z.ZodBoolean>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    roles: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const UpdateUserSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    passwordRaw: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const UserIdSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const ChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=users.schemas.d.ts.map