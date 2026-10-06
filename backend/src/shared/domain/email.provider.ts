export interface SendCustomEmailOptions {
    to: string;
    subject: string;
    htmlContent: string;
    logoUrl?: string;
    projectName?: string;
}

export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    message?: string;
    error?: string;
}

export interface EmailProvider {
    sendEmail(options: SendCustomEmailOptions): Promise<SendEmailResult>;
    sendWelcomeCredentialsEmail(
        to: string,
        name: string,
        tempPassword: string,
        projectName?: string
    ): Promise<SendEmailResult>;
}
