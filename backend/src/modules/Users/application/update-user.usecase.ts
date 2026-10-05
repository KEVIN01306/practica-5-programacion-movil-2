import type { UsersRepository } from "../domain/users.repository.js";
import type { UpdateUser, GetUser } from "../domain/user.entity.js";
import AppError from "@shared/errors/AppError.js";
import { UniqueConstraintError } from "@shared/db/database/errors/UniqueConstraintError.js";
import { NotFoundPersistenceError } from "@shared/db/database/errors/NotFoundPersistenceError.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import { isValidUserEmailDomain } from "../presentation/users.schemas.js";

export class UpdateUserUseCase {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, data: UpdateUser, context?: AuditContext): Promise<GetUser> {
        try {
            const user = await this.usersRepository.findById(id);
            if (!user) {
                throw new AppError("User not found", "USER_NOT_FOUND", 404);
            }

            if (data.email && data.email !== user.email) {
                if (!isValidUserEmailDomain(data.email)) {
                    throw new AppError(
                        "Dominio inválido para este usuario. Solo se permiten correos @pharmadel.com o @cadimportinc.com.",
                        "INVALID_EMAIL_DOMAIN",
                        400
                    );
                }

                const existingEmail = await this.usersRepository.findByEmail(data.email);
                if (existingEmail) {
                    throw new AppError("Email already in use", "EMAIL_ALREADY_EXISTS", 400);
                }
            }

            const updatedUser = await this.usersRepository.update(id, data);

            await this.auditLogService.record({
                userId: context?.userId,
                action: 'UPDATE',
                resource: 'user',
                resourceId: updatedUser.id,
                context,
                before: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roles: user.roles,
                    isActive: user.isActive
                },
                after: {
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    roles: updatedUser.roles,
                    isActive: updatedUser.isActive
                }
            });

            return updatedUser;
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError("Email already in use", "EMAIL_ALREADY_EXISTS", 400);
            }
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("User not found", "USER_NOT_FOUND", 404);
            }
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Error updating user", "INTERNAL_SERVER_ERROR", 500);
        }
    }
}

