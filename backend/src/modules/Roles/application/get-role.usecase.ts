import type { RolesRepository } from "../domain/roles.repository.js";
import type { Role } from "../domain/role.entity.js";
import AppError from "@shared/errors/AppError.js";

export class GetRoleUseCase {
    constructor(private readonly rolesRepository: RolesRepository) {}

    async execute(id: string): Promise<Role> {
        const role = await this.rolesRepository.findById(id);
        if (!role) {
            throw new AppError("Role not found", "NOT_FOUND", 404);
        }
        return role;
    }
}
