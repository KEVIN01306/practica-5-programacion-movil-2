export class ListPermissionsUseCase {
    rolesRepository;
    constructor(rolesRepository) {
        this.rolesRepository = rolesRepository;
    }
    async execute() {
        return this.rolesRepository.findAllPermissions();
    }
}
//# sourceMappingURL=list-permissions.usecase.js.map