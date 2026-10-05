import type { UsersRepository } from "../domain/users.repository.js";
import type { GetUser } from "../domain/user.entity.js";
import AppError from "@shared/errors/AppError.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import { UniqueConstraintError } from "@shared/db/database/errors/UniqueConstraintError.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import { isValidUserEmailDomain } from "../presentation/users.schemas.js";

interface CreateUserRequest {
    email: string;
    passwordRaw: string;
    firstName: string;
    lastName: string;
    roles?: string[];
}

export class CreateUserUseCase {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly hashProvider: HashProvider,
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

            const passwordHash = await this.hashProvider.hash(data.passwordRaw);

            const user = await this.usersRepository.create({
                email: data.email,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                roles: data.roles
            });

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
                    isActive: user.isActive
                }
            });

            return user;
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

