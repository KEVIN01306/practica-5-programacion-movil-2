import type { RolesRepository } from "../domain/roles.repository.js";
import type { Permission } from "../domain/role.entity.js";
export declare class GetRolePermissionsUseCase {
    private readonly rolesRepository;
    constructor(rolesRepository: RolesRepository);
    execute(roleId: string): Promise<Permission[]>;
}
//# sourceMappingURL=get-role-permissions.usecase.d.ts.map