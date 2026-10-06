import AppError from "../../../shared/errors/AppError.js";
export class VerifyOtpUseCase {
    otpProvider;
    jwtProvider;
    usersRepository;
    auditLogService;
    constructor(otpProvider, jwtProvider, usersRepository, auditLogService) {
        this.otpProvider = otpProvider;
        this.jwtProvider = jwtProvider;
        this.usersRepository = usersRepository;
        this.auditLogService = auditLogService;
    }
    async execute(dto, context) {
        const email = dto.email.trim().toLowerCase();
        const code = dto.code.trim();
        const type = dto.type || "PASSWORD_RESET";
        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            throw new AppError("Usuario no encontrado", "USER_NOT_FOUND", 404);
        }
        if (!user.isActive) {
            throw new AppError("Esta cuenta se encuentra inactiva", "USER_INACTIVE", 403);
        }
        const verifyResult = await this.otpProvider.verifyOtp(email, code, type);
        if (!verifyResult.verified) {
            throw new AppError("Código OTP incorrecto", "INVALID_OTP", 400);
        }
        // Generate temporary single-use reset token bound to this user/email
        const resetToken = await this.jwtProvider.generateResetToken(user.id, email);
        await this.auditLogService.record({
            userId: user.id,
            action: 'UPDATE',
            resource: 'auth',
            resourceId: user.id,
            context,
            details: {
                action: "otp_verified",
                type,
                email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
            }
        });
        return {
            success: true,
            verified: true,
            resetToken,
            message: "Identidad verificada exitosamente",
        };
    }
}
//# sourceMappingURL=verify-otp.usecase.js.map