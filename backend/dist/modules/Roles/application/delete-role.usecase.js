import AppError from "../../../shared/errors/AppError.js";
export class DeleteRoleUseCase {
    rolesRepository;
    auditLogService;
    constructor(rolesRepository, auditLogService) {
        this.rolesRepository = rolesRepository;
        this.auditLogService = auditLogService;
    }
    async execute(id, auditContext) {
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
//# sourceMappingURL=delete-role.usecase.js.map