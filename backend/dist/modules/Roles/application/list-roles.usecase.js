export class ListRolesUseCase {
    rolesRepository;
    constructor(rolesRepository) {
        this.rolesRepository = rolesRepository;
    }
    async execute(params) {
        const result = await this.rolesRepository.findAll(params);
        if (params.all) {
            return result.data;
        }
        return result;
    }
}
//# sourceMappingURL=list-roles.usecase.js.map