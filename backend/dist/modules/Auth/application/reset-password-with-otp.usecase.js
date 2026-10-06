import AppError from "../../../shared/errors/AppError.js";
export class ResetPasswordWithOtpUseCase {
    jwtProvider;
    usersRepository;
    authRepository;
    hashProvider;
    auditLogService;
    constructor(jwtProvider, usersRepository, authRepository, hashProvider, auditLogService) {
        this.jwtProvider = jwtProvider;
        this.usersRepository = usersRepository;
        this.authRepository = authRepository;
        this.hashProvider = hashProvider;
        this.auditLogService = auditLogService;
    }
    async execute(dto, context) {
        // 1. Verify reset token validity and single-use status
        const { userId, email, jti } = await this.jwtProvider.verifyResetToken(dto.resetToken);
        // 2. Fetch user with password
        const user = await this.usersRepository.findByIdWithPassword(userId);
        if (!user) {
            throw new AppError("Usuario no encontrado", "USER_NOT_FOUND", 404);
        }
        if (!user.isActive) {
            throw new AppError("Esta cuenta se encuentra inactiva", "USER_INACTIVE", 403);
        }
        // 3. If current password is provided, validate it
        if (dto.currentPassword) {
            if (!user.passwordHash) {
                throw new AppError("El usuario no tiene una contraseña configurada", "NO_PASSWORD", 400);
            }
            const isCurrentValid = await this.hashProvider.compare(dto.currentPassword, user.passwordHash);
            if (!isCurrentValid) {
                throw new AppError("La contraseña actual es incorrecta", "INVALID_CURRENT_PASSWORD", 400);
            }
        }
        // 4. Validate new password
        if (dto.newPassword.length < 8) {
            throw new AppError("La nueva contraseña debe tener al menos 8 caracteres", "INVALID_PASSWORD_LENGTH", 400);
        }
        if (dto.confirmPassword && dto.newPassword !== dto.confirmPassword) {
            throw new AppError("Las contraseñas no coinciden", "PASSWORDS_DO_NOT_MATCH", 400);
        }
        // Check that new password is not identical to current password
        if (user.passwordHash) {
            const isSameAsCurrent = await this.hashProvider.compare(dto.newPassword, user.passwordHash);
            if (isSameAsCurrent) {
                throw new AppError("La nueva contraseña no puede ser igual a la contraseña actual", "SAME_PASSWORD", 400);
            }
        }
        // 5. Hash new password with Argon2
        const newPasswordHash = await this.hashProvider.hash(dto.newPassword);
        // 6. Update user's password in database
        await this.usersRepository.updatePassword(userId, newPasswordHash);
        // 7. Activate / verify user account
        await this.usersRepository.updateVerification(userId, true);
        // 8. Invalidate sessions to enforce re-login
        await this.authRepository.deleteSession(userId);
        // 9. Consume single-use reset token
        this.jwtProvider.consumeResetToken(jti);
        // 9. Record audit log
        await this.auditLogService.record({
            userId,
            action: 'UPDATE',
            resource: 'auth',
            resourceId: userId,
            context,
            details: {
                action: "password_reset_otp_completed",
                email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
                description: "Usuario actualizó su contraseña exitosamente mediante verificación OTP.",
            }
        });
    }
}
//# sourceMappingURL=reset-password-with-otp.usecase.js.map