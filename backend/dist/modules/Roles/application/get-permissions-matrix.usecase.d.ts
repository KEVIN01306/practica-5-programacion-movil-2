import type { RolesRepository } from "../domain/roles.repository.js";
import type { PermissionsMatrix } from "../domain/role.entity.js";
export declare class GetPermissionsMatrixUseCase {
    private readonly rolesRepository;
    constructor(rolesRepository: RolesRepository);
    execute(): Promise<PermissionsMatrix>;
}
//# sourceMappingURL=get-permissions-matrix.usecase.d.ts.map