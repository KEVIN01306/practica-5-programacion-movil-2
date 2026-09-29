import AppError from "../../../shared/errors/AppError.js";
export class GetRolePermissionsUseCase {
    rolesRepository;
    constructor(rolesRepository) {
        this.rolesRepository = rolesRepository;
    }
    async execute(roleId) {
        const role = await this.rolesRepository.findById(roleId);
        if (!role) {
            throw new AppError("Role not found", "NOT_FOUND", 404);
        }
        return this.rolesRepository.findRolePermissions(roleId);
    }
}
//# sourceMappingURL=get-role-permissions.usecase.js.map