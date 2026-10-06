import AppError from "../../../shared/errors/AppError.js";
export class SendOtpUseCase {
    otpProvider;
    usersRepository;
    auditLogService;
    constructor(otpProvider, usersRepository, auditLogService) {
        this.otpProvider = otpProvider;
        this.usersRepository = usersRepository;
        this.auditLogService = auditLogService;
    }
    async execute(dto, context) {
        const email = dto.email.trim().toLowerCase();
        // Check if user exists and is active
        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            throw new AppError("No existe ninguna cuenta asociada a este correo electrónico", "USER_NOT_FOUND", 404);
        }
        if (!user.isActive) {
            throw new AppError("Esta cuenta se encuentra inactiva o deshabilitada", "USER_INACTIVE", 403);
        }
        const type = dto.type || "PASSWORD_RESET";
        const result = await this.otpProvider.sendOtp(email, type);
        // Audit log
        await this.auditLogService.record({
            userId: user.id,
            action: 'UPDATE',
            resource: 'auth',
            resourceId: user.id,
            context,
            details: {
                action: "otp_sent",
                type,
                email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"), // Sanitized in logs
            }
        });
        return result;
    }
}
//# sourceMappingURL=send-otp.usecase.js.map