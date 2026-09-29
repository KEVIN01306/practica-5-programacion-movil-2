export class GetPermissionsMatrixUseCase {
    rolesRepository;
    constructor(rolesRepository) {
        this.rolesRepository = rolesRepository;
    }
    async execute() {
        return this.rolesRepository.getPermissionsMatrix();
    }
}
//# sourceMappingURL=get-permissions-matrix.usecase.js.map