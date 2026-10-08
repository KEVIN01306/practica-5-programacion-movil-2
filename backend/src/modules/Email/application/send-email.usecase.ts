import type { IEmailProvider, SendEmailResult } from '../domain/email.provider.js';
import type { AuditLogService } from '../../Audit/application/audit-log.service.js';
import AppError from '../../../shared/errors/AppError.js';
import { Logger } from '../../../shared/logger/logger.js';

export interface SendEmailInput {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string | string[];
    userId?: string | null;
}

export interface SendEmailOutput {
    success: boolean;
    message: string;
    messageId?: string;
}

export class SendEmailUseCase {
    constructor(
        private readonly emailProvider: IEmailProvider,
        private readonly auditLogService?: AuditLogService
    ) {}

    public async execute(input: SendEmailInput): Promise<SendEmailOutput> {
        const toList = Array.isArray(input.to) ? input.to : [input.to];
        if (toList.length === 0) {
            throw new AppError('At least one recipient email address is required.', 'INVALID_RECIPIENT', 400);
        }

        const subject = input.subject?.trim();
        if (!subject) {
            throw new AppError('Email subject cannot be empty.', 'INVALID_SUBJECT', 400);
        }

        const html = input.html?.trim();
        if (!html) {
            throw new AppError('Email HTML content cannot be empty.', 'INVALID_HTML_CONTENT', 400);
        }

        const result: SendEmailResult = await this.emailProvider.sendEmail({
            to: input.to,
            subject,
            html,
            text: input.text,
            from: input.from,
            replyTo: input.replyTo,
        });

        if (!result.success) {
            Logger.error('Failed to dispatch email', result.error, {
                to: input.to,
                subject,
            });
            throw new AppError(
                `Failed to send email: ${result.error || 'Provider communication error'}`,
                'EMAIL_SEND_FAILED',
                500
            );
        }

        if (this.auditLogService) {
            await this.auditLogService.record({
                action: 'CREATE',
                resource: 'emails',
                userId: input.userId,
                details: {
                    to: input.to,
                    subject,
                    messageId: result.messageId,
                },
            });
        }

        return {
            success: true,
            message: 'Email sent successfully',
            messageId: result.messageId,
        };
    }
}
