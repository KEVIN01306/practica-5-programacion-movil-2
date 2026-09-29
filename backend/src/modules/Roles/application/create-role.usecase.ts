import type { RolesRepository } from "../domain/roles.repository.js";
import type { Role, CreateRole } from "../domain/role.entity.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import AppError from "@shared/errors/AppError.js";

export class CreateRoleUseCase {
    constructor(
        private readonly rolesRepository: RolesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(data: CreateRole, auditContext?: AuditContext): Promise<Role> {
        if (!data.name || !data.name.trim()) {
            throw new AppError("Role name is required", "BAD_REQUEST", 400);
        }

        const trimmedName = data.name.trim().toUpperCase();

        const existing = await this.rolesRepository.findByName(trimmedName);
        if (existing) {
            throw new AppError(`A role with name "${trimmedName}" already exists`, "CONFLICT", 409);
        }

        const role = await this.rolesRepository.create({
            name: trimmedName,
            description: data.description?.trim() || null,
        });

        await this.auditLogService.record({
            action: "CREATE",
            resource: "role",
            resourceId: role.id,
            context: auditContext,
            after: {
                id: role.id,
                name: role.name,
                description: role.description,
                isSystem: role.isSystem,
            },
            details: {
                roleName: role.name,
            }
        });

        return role;
    }
}
