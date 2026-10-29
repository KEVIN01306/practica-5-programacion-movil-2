import type { OtpProvider } from "../domain/otp.provider.js";
import type JwtProvider from "../domain/jwt.provider.js";
import type { UsersRepository } from "../../Users/domain/users.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "@shared/errors/AppError.js";

export interface VerifyOtpDTO {
    email: string;
    code: string;
    type?: 'PASSWORD_RESET' | 'OTP';
}

export interface VerifyOtpResponse {
    success: boolean;
    verified: boolean;
    resetToken: string;
    message: string;
}

export class VerifyOtpUseCase {
    constructor(
        private readonly otpProvider: OtpProvider,
        private readonly jwtProvider: JwtProvider,
        private readonly usersRepository: UsersRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(dto: VerifyOtpDTO, context?: AuditContext): Promise<VerifyOtpResponse> {
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
