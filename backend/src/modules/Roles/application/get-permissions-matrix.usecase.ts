import type { RolesRepository } from "../domain/roles.repository.js";
import type { PermissionsMatrix } from "../domain/role.entity.js";

export class GetPermissionsMatrixUseCase {
    constructor(private readonly rolesRepository: RolesRepository) {}

    async execute(): Promise<PermissionsMatrix> {
        return this.rolesRepository.getPermissionsMatrix();
    }
}
