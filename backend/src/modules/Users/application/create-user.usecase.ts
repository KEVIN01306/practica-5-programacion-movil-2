import type { UsersRepository } from "../domain/users.repository.js";
import type { GetUser } from "../domain/user.entity.js";
import AppError from "@shared/errors/AppError.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import type { EmailProvider } from "@shared/domain/email.provider.js";
import { UniqueConstraintError } from "@shared/db/database/errors/UniqueConstraintError.js";
import { generateSecurePassword } from "@shared/utils/password-generator.util.js";
import type { Role } from "@prisma/client";

export interface CreateUserRequest {
    email: string;
    passwordRaw?: string;
    autoGeneratePassword?: boolean;
    firstName: string;
    lastName: string;
    role?: Role;
    roles?: string[];
}

export class CreateUserUseCase {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly hashProvider: HashProvider,
        private readonly emailProvider: EmailProvider
    ) {}

    async execute(data: CreateUserRequest): Promise<GetUser> {
        try {
            const existingUser = await this.usersRepository.findByEmail(data.email);
            if (existingUser) {
                throw new AppError("Email already in use", "EMAIL_ALREADY_EXISTS", 400);
            }

            // Determine or generate secure password
            let rawPassword = data.passwordRaw?.trim();
            if (data.autoGeneratePassword || !rawPassword) {
                rawPassword = generateSecurePassword(12);
            }

            if (rawPassword.length < 8) {
                throw new AppError("Password must be at least 8 characters long", "INVALID_PASSWORD_LENGTH", 400);
            }

            const passwordHash = await this.hashProvider.hash(rawPassword);

            const user = await this.usersRepository.create({
                email: data.email,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                roles: data.roles,
            });

            // Optional welcome email
            let emailSent = false;
            try {
                const fullName = `${user.firstName} ${user.lastName}`.trim();
                const emailResult = await this.emailProvider.sendWelcomeCredentialsEmail(
                    user.email,
                    fullName,
                    rawPassword
                );
                emailSent = emailResult.success;
            } catch (err) {
                console.warn("Could not send credentials email:", err);
            }

            return {
                ...user,
                emailSent,
                generatedPassword: data.autoGeneratePassword ? rawPassword : undefined,
            };
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError("Email already in use", "EMAIL_ALREADY_EXISTS", 400);
            }
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Error creating user", "INTERNAL_SERVER_ERROR", 500);
        }
    }
}
