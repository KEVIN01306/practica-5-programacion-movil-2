import type { IEmailProvider, SendEmailOptions, SendEmailResult } from '../domain/email.provider.js';
import { Logger } from '../../../shared/logger/logger.js';

export class MockEmailProvider implements IEmailProvider {
    public sentEmails: SendEmailOptions[] = [];
    public shouldFail: boolean = false;
    public failureError: string = 'Simulated email provider failure';

    public async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
        if (this.shouldFail) {
            Logger.warn('[MockEmailProvider] Simulated failure triggered', {
                to: options.to,
                subject: options.subject,
            });
            return {
                success: false,
                error: this.failureError,
            };
        }

        this.sentEmails.push({ ...options });
        Logger.info('[MockEmailProvider] Recorded email in memory', {
            to: options.to,
            subject: options.subject,
        });

        return {
            success: true,
            messageId: `mock-msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        };
    }

    public clear(): void {
        this.sentEmails = [];
        this.shouldFail = false;
    }
}
