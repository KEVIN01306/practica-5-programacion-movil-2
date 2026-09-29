import AppError from "../../../shared/errors/AppError.js";
export class GetRoleUseCase {
    rolesRepository;
    constructor(rolesRepository) {
        this.rolesRepository = rolesRepository;
    }
    async execute(id) {
        const role = await this.rolesRepository.findById(id);
        if (!role) {
            throw new AppError("Role not found", "NOT_FOUND", 404);
        }
        return role;
    }
}
//# sourceMappingURL=get-role.usecase.js.map