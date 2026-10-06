import type { UsersRepository } from "../domain/users.repository.js";
import type { GetUser } from "../domain/user.entity.js";
import AppError from "@shared/errors/AppError.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import type { EmailProvider } from "@shared/domain/email.provider.js";
import { UniqueConstraintError } from "@shared/db/database/errors/UniqueConstraintError.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import { isValidUserEmailDomain } from "../presentation/users.schemas.js";
import { generateSecurePassword } from "@shared/utils/password-generator.util.js";

export interface CreateUserRequest {
    email: string;
    passwordRaw?: string;
    autoGeneratePassword?: boolean;
    firstName: string;
    lastName: string;
    roles?: string[];
}

export class CreateUserUseCase {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly hashProvider: HashProvider,
        private readonly emailProvider: EmailProvider,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(data: CreateUserRequest, context?: AuditContext): Promise<GetUser> {
        try {
            if (!isValidUserEmailDomain(data.email)) {
                throw new AppError(
                    "Dominio inválido para este usuario. Solo se permiten correos @pharmadel.com o @cadimportinc.com.",
                    "INVALID_EMAIL_DOMAIN",
                    400
                );
            }

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

            // User starts unverified (isVerify = false)
            const user = await this.usersRepository.create({
                email: data.email,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                roles: data.roles,
                isVerify: false,
            });

            // Send credentials email via OTP / Email microservice (POST /api/v1/email/send)
            const fullName = `${user.firstName} ${user.lastName}`.trim();
            const emailResult = await this.emailProvider.sendWelcomeCredentialsEmail(
                user.email,
                fullName,
                rawPassword
            );

            // Record audit log
            await this.auditLogService.record({
                userId: context?.userId,
                action: 'CREATE',
                resource: 'user',
                resourceId: user.id,
                context,
                details: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roles: user.roles,
                    isActive: user.isActive,
                    isVerify: false,
                    welcomeEmailSent: emailResult.success,
                    emailMessageId: emailResult.messageId || null,
                }
            });

            return {
                ...user,
                isVerify: false,
                emailSent: emailResult.success,
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
