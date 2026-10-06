import AppError from "../../../shared/errors/AppError.js";
import { NotFoundPersistenceError } from "../../../shared/db/database/errors/NotFoundPersistenceError.js";
export class ActivateUserUseCase {
    usersRepository;
    auditLogService;
    constructor(usersRepository, auditLogService) {
        this.usersRepository = usersRepository;
        this.auditLogService = auditLogService;
    }
    async execute(id, context) {
        try {
            const user = await this.usersRepository.findById(id);
            if (!user) {
                throw new AppError("User not found", "USER_NOT_FOUND", 404);
            }
            if (user.isActive) {
                throw new AppError("User is already active", "USER_ALREADY_ACTIVE", 400);
            }
            const activatedUser = await this.usersRepository.activate(id);
            await this.auditLogService.record({
                userId: context?.userId,
                action: 'UPDATE',
                resource: 'user',
                resourceId: id,
                context,
                before: { isActive: user.isActive },
                after: { isActive: true },
                details: {
                    userEmail: user.email,
                    action: "activate",
                    description: "User account reactivated"
                }
            });
            return activatedUser;
        }
        catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("User not found", "USER_NOT_FOUND", 404);
            }
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Error activating user", "INTERNAL_SERVER_ERROR", 500);
        }
    }
}
//# sourceMappingURL=activate-user.usecase.js.map