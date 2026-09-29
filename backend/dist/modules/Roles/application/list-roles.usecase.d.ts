import type { RolesRepository, ListRolesParams } from "../domain/roles.repository.js";
import type { Role } from "../domain/role.entity.js";
export declare class ListRolesUseCase {
    private readonly rolesRepository;
    constructor(rolesRepository: RolesRepository);
    execute(params: ListRolesParams): Promise<{
        data: Role[];
        total: number;
    } | Role[]>;
}
//# sourceMappingURL=list-roles.usecase.d.ts.map