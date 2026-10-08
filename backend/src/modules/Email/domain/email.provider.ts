export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string | string[];
}

export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Domain interface / Contract for Email Delivery Providers.
 * Decouples the application layer from concrete vendors (Resend, SendGrid, AWS SES, SMTP, etc.).
 */
export interface IEmailProvider {
    sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
}
