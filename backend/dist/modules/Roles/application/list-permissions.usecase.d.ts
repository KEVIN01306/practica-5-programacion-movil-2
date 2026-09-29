import type { RolesRepository } from "../domain/roles.repository.js";
import type { Permission } from "../domain/role.entity.js";
export declare class ListPermissionsUseCase {
    private readonly rolesRepository;
    constructor(rolesRepository: RolesRepository);
    execute(): Promise<Permission[]>;
}
//# sourceMappingURL=list-permissions.usecase.d.ts.map