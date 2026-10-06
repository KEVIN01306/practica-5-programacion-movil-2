import type { EmailProvider, SendCustomEmailOptions, SendEmailResult } from "../domain/email.provider.js";
export declare class HttpEmailProvider implements EmailProvider {
    private readonly baseUrl;
    private readonly apiKey;
    private readonly logoUrl;
    constructor(baseUrl?: string, apiKey?: string, logoUrl?: string);
    sendEmail(options: SendCustomEmailOptions): Promise<SendEmailResult>;
    sendWelcomeCredentialsEmail(to: string, name: string, tempPassword: string, projectName?: string): Promise<SendEmailResult>;
}
//# sourceMappingURL=http-email.provider.d.ts.map