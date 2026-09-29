import type { RolesRepository } from "../domain/roles.repository.js";
import type { Permission } from "../domain/role.entity.js";

export class ListPermissionsUseCase {
    constructor(private readonly rolesRepository: RolesRepository) {}

    async execute(): Promise<Permission[]> {
        return this.rolesRepository.findAllPermissions();
    }
}
