import type { RolesRepository } from "../domain/roles.repository.js";
import type { Role } from "../domain/role.entity.js";
export declare class GetRoleUseCase {
    private readonly rolesRepository;
    constructor(rolesRepository: RolesRepository);
    execute(id: string): Promise<Role>;
}
//# sourceMappingURL=get-role.usecase.d.ts.map