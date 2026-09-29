import type { RolesRepository, ListRolesParams } from "../domain/roles.repository.js";
import type { Role } from "../domain/role.entity.js";

export class ListRolesUseCase {
    constructor(private readonly rolesRepository: RolesRepository) {}

    async execute(params: ListRolesParams): Promise<{ data: Role[]; total: number } | Role[]> {
        const result = await this.rolesRepository.findAll(params);
        if (params.all) {
            return result.data;
        }
        return result;
    }
}
