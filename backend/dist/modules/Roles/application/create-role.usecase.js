import AppError from "../../../shared/errors/AppError.js";
export class CreateRoleUseCase {
    rolesRepository;
    auditLogService;
    constructor(rolesRepository, auditLogService) {
        this.rolesRepository = rolesRepository;
        this.auditLogService = auditLogService;
    }
    async execute(data, auditContext) {
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
//# sourceMappingURL=create-role.usecase.js.map