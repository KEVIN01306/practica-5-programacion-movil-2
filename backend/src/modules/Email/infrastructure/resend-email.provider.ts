import { Resend } from 'resend';
import type { IEmailProvider, SendEmailOptions, SendEmailResult } from '../domain/email.provider.js';
import { config } from '../../../shared/config/env.config.js';
import { Logger } from '../../../shared/logger/logger.js';

export class ResendEmailProvider implements IEmailProvider {
    private resend: Resend | null = null;
    private fromEmail: string;

    constructor(apiKey?: string, fromEmail?: string) {
        const key = apiKey !== undefined ? apiKey : config.resendApiKey;
        this.fromEmail = fromEmail !== undefined ? fromEmail : config.emailFrom;

        if (key && key.trim() !== '') {
            this.resend = new Resend(key.trim());
        } else {
            Logger.warn('[ResendEmailProvider] Initialized without RESEND_API_KEY. Real email dispatch is disabled.');
        }
    }

    public async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
        if (!this.resend) {
            Logger.warn('[ResendEmailProvider] Cannot send email: RESEND_API_KEY is not configured.', {
                to: options.to,
                subject: options.subject,
            });
            return {
                success: false,
                error: 'Email provider not configured with valid API key',
            };
        }

        try {
            const fromAddress = options.from || this.fromEmail;
            const toList = (Array.isArray(options.to) ? options.to : [options.to])
                .map((e) => (typeof e === 'string' ? e.trim() : ''))
                .filter((e) => Boolean(e) && e.includes('@'));

            if (toList.length === 0) {
                return {
                    success: false,
                    error: 'No valid recipient email addresses provided',
                };
            }

            const results: { to: string; success: boolean; messageId?: string; error?: string }[] = [];

            // Dispatch to each recipient individually for resilience & privacy
            for (const recipient of toList) {
                try {
                    let activeFrom = fromAddress;
                    let response = await this.resend.emails.send({
                        from: activeFrom,
                        to: recipient,
                        subject: options.subject,
                        html: options.html,
                        text: options.text || options.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
                        replyTo: options.replyTo,
                    });

                    // If custom from address fails for any reason (unverified domain, 403, 422, format), automatically fallback to default verified fromEmail
                    if (response.error && activeFrom !== this.fromEmail && this.fromEmail) {
                        Logger.warn(
                            `[ResendEmailProvider] Custom from '${activeFrom}' failed (${response.error.message}). Falling back to default verified sender '${this.fromEmail}' for recipient ${recipient}.`
                        );

                        // Extract clean display name (e.g. "rapidol" from "rapidol <noresponder@rapidolusa.com>")
                        let cleanName = '';
                        if (activeFrom.includes('<')) {
                            cleanName = activeFrom.split('<')[0]?.replace(/[<>"'\\]/g, '').trim() || '';
                        } else if (!activeFrom.includes('@')) {
                            cleanName = activeFrom.replace(/[<>"'\\]/g, '').trim();
                        }

                        activeFrom = cleanName && !this.fromEmail.includes('<')
                            ? `${cleanName} <${this.fromEmail}>`
                            : this.fromEmail;

                        response = await this.resend.emails.send({
                            from: activeFrom,
                            to: recipient,
                            subject: options.subject,
                            html: options.html,
                            text: options.text || options.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
                            replyTo: options.replyTo,
                        });
                    }

                    if (response.error) {
                        Logger.warn(`[ResendEmailProvider] Error sending to ${recipient}`, {
                            error: response.error.message,
                            statusCode: (response.error as any).statusCode,
                        });
                        results.push({
                            to: recipient,
                            success: false,
                            error: response.error.message,
                        });
                    } else {
                        Logger.info(`[ResendEmailProvider] Email successfully sent to ${recipient} (from: ${activeFrom})`, {
                            messageId: response.data?.id,
                        });
                        results.push({
                            to: recipient,
                            success: true,
                            messageId: response.data?.id,
                        });
                    }
                } catch (sendErr: any) {
                    Logger.error(`[ResendEmailProvider] Exception sending to ${recipient}`, sendErr);
                    results.push({
                        to: recipient,
                        success: false,
                        error: sendErr?.message || 'Failed to dispatch email',
                    });
                }
            }

            const successfulDeliveries = results.filter((r) => r.success);

            if (successfulDeliveries.length > 0) {
                return {
                    success: true,
                    messageId: successfulDeliveries[0]?.messageId,
                };
            }

            // All recipients failed
            const combinedErrors = results.map((r) => `${r.to}: ${r.error}`).join('; ');
            return {
                success: false,
                error: combinedErrors,
            };
        } catch (error: any) {
            Logger.error('[ResendEmailProvider] Failed to execute email dispatch', error, {
                to: options.to,
                subject: options.subject,
            });
            return {
                success: false,
                error: error?.message || 'Unexpected error sending email via Resend',
            };
        }
    }
}
