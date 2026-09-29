import type { RolesRepository } from "../domain/roles.repository.js";
import type { Role, UpdateRole } from "../domain/role.entity.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";
import AppError from "@shared/errors/AppError.js";

export class UpdateRoleUseCase {
    constructor(
        private readonly rolesRepository: RolesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, data: UpdateRole, auditContext?: AuditContext): Promise<Role> {
        const existing = await this.rolesRepository.findById(id);
        if (!existing) {
            throw new AppError("Role not found", "NOT_FOUND", 404);
        }

        const updatePayload: UpdateRole = {};

        if (data.name !== undefined && data.name.trim()) {
            const normalizedName = data.name.trim().toUpperCase();
            if (normalizedName !== existing.name) {
                const nameCheck = await this.rolesRepository.findByName(normalizedName);
                if (nameCheck && nameCheck.id !== id) {
                    throw new AppError(`A role with name "${normalizedName}" already exists`, "CONFLICT", 409);
                }
            }
            updatePayload.name = normalizedName;
        }

        if (data.description !== undefined) {
            updatePayload.description = data.description?.trim() || null;
        }

        const updatedRole = await this.rolesRepository.update(id, updatePayload);

        await this.auditLogService.record({
            action: "UPDATE",
            resource: "role",
            resourceId: id,
            context: auditContext,
            before: {
                name: existing.name,
                description: existing.description,
            },
            after: {
                name: updatedRole.name,
                description: updatedRole.description,
            },
            details: {
                roleName: updatedRole.name,
                isSystem: updatedRole.isSystem,
            }
        });

        return updatedRole;
    }
}
