import type { UsersRepository } from "../domain/users.repository.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import AppError from "@shared/errors/AppError.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";

interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
}

export class ChangePasswordUseCase {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly hashProvider: HashProvider,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(userId: string, data: ChangePasswordRequest, context?: AuditContext): Promise<void> {
        try {
            const user = await this.usersRepository.findByIdWithPassword(userId);
            if (!user) {
                throw new AppError("User not found", "USER_NOT_FOUND", 404);
            }

            if (!user.isActive) {
                throw new AppError("User is inactive", "USER_INACTIVE", 403);
            }

            if (!user.passwordHash) {
                throw new AppError("User has no password set", "NO_PASSWORD", 400);
            }

            const isValid = await this.hashProvider.compare(data.currentPassword, user.passwordHash);
            if (!isValid) {
                throw new AppError("La contraseña actual es incorrecta.", "INVALID_CURRENT_PASSWORD", 400);
            }

            if (data.newPassword.length < 8) {
                throw new AppError("Password must be at least 8 characters long", "INVALID_PASSWORD_LENGTH", 400);
            }

            const newPasswordHash = await this.hashProvider.hash(data.newPassword);
            await this.usersRepository.updatePassword(userId, newPasswordHash);

            // Record audit log - NEVER store plain passwords, new passwords, or hashes!
            await this.auditLogService.record({
                userId,
                action: 'UPDATE',
                resource: 'user',
                resourceId: userId,
                context,
                details: {
                    action: "change_password",
                    description: "Usuario cambió su contraseña."
                }
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Error changing password", "INTERNAL_SERVER_ERROR", 500);
        }
    }
}
