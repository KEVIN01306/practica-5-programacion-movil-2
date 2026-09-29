import type { RolesRepository } from "../domain/roles.repository.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import AppError from "@shared/errors/AppError.js";

export class DeleteRoleUseCase {
    constructor(
        private readonly rolesRepository: RolesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, auditContext?: AuditContext): Promise<void> {
        const existing = await this.rolesRepository.findById(id);
        if (!existing) {
            throw new AppError("Role not found", "NOT_FOUND", 404);
        }

        if (existing.isSystem) {
            throw new AppError("System roles cannot be deleted", "BAD_REQUEST", 400);
        }

        await this.rolesRepository.delete(id);

        await this.auditLogService.record({
            action: "DELETE",
            resource: "role",
            resourceId: id,
            context: auditContext,
            before: {
                id: existing.id,
                name: existing.name,
                description: existing.description,
                isSystem: existing.isSystem,
            },
            details: {
                deleted: {
                    id: existing.id,
                    name: existing.name,
                    description: existing.description,
                    isSystem: existing.isSystem,
                }
            }
        });
    }
}
