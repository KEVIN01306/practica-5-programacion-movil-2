import AppError from "../../../shared/errors/AppError.js";
export class GetProfileUseCase {
    authRepository;
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async execute(userId) {
        const user = await this.authRepository.findById(userId);
        if (!user) {
            throw new AppError("User not found", "NOT_FOUND", 404);
        }
        return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`.trim(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roles: user.roles,
            permissions: user.permissions,
            isActive: user.isActive,
            createdAt: user.createdAt,
        };
    }
}
//# sourceMappingURL=get-profile.usecase.js.map