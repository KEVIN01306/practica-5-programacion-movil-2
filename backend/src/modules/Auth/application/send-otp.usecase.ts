import type { OtpProvider, SendOtpResult } from "../domain/otp.provider.js";
import type { UsersRepository } from "../../Users/domain/users.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "@shared/errors/AppError.js";

export interface SendOtpDTO {
    email: string;
    type?: 'PASSWORD_RESET' | 'OTP';
}

export class SendOtpUseCase {
    constructor(
        private readonly otpProvider: OtpProvider,
        private readonly usersRepository: UsersRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(dto: SendOtpDTO, context?: AuditContext): Promise<SendOtpResult> {
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
