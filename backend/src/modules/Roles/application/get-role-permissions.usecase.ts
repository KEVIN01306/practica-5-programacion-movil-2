import type { RolesRepository } from "../domain/roles.repository.js";
import type { Permission } from "../domain/role.entity.js";
import AppError from "@shared/errors/AppError.js";

export class GetRolePermissionsUseCase {
    constructor(private readonly rolesRepository: RolesRepository) {}

    async execute(roleId: string): Promise<Permission[]> {
        const role = await this.rolesRepository.findById(roleId);
        if (!role) {
            throw new AppError("Role not found", "NOT_FOUND", 404);
        }

        return this.rolesRepository.findRolePermissions(roleId);
    }
}
