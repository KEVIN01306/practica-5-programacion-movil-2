import type { FormsRepository } from "../domain/forms.repository.js";
import type { FormFieldsRepository } from "../domain/form-fields.repository.js";
import type { FormSubmissionsRepository } from "../domain/form-submissions.repository.js";
import type { ContactsRepository } from "../domain/contacts.repository.js";
import type { FormFieldEntity } from "../domain/form-field.entity.js";
import type { FormSubmissionEntity } from "../domain/form-submission.entity.js";
import type { EmailTemplatesRepository } from "../../EmailTemplates/domain/email-templates.repository.js";
import type { WebsitesRepository } from "../../Websites/domain/websites.repository.js";
import type { IEmailProvider } from "../../Email/domain/email.provider.js";
import { TemplateRenderer } from "../../Email/domain/template-renderer.js";
import AppError from "../../../shared/errors/AppError.js";
import { Logger } from "../../../shared/logger/logger.js";

export interface SubmitPublicFormInput {
    websiteId: string;
    slug: string;
    payload: Record<string, any>;
}

export class SubmitPublicFormUseCase {
    constructor(
        private readonly formsRepository: FormsRepository,
        private readonly formFieldsRepository: FormFieldsRepository,
        private readonly formSubmissionsRepository: FormSubmissionsRepository,
        private readonly contactsRepository: ContactsRepository,
        private readonly emailTemplatesRepository?: EmailTemplatesRepository,
        private readonly emailProvider?: IEmailProvider,
        private readonly websitesRepository?: WebsitesRepository
    ) { }

    async execute(input: SubmitPublicFormInput): Promise<FormSubmissionEntity> {
        const { websiteId, slug, payload } = input;

        // 1. Find Form by websiteId and slug
        const form = await this.formsRepository.findBySlug(websiteId, slug);
        if (!form) {
            throw new AppError(
                `Form with slug '${slug}' was not found for this website.`,
                "FORM_NOT_FOUND",
                404
            );
        }

        // 2. Retrieve defined FormFields
        const fields = await this.formFieldsRepository.listByFormId(form.id);
        const fieldMap = new Map<string, FormFieldEntity>();
        for (const field of fields) {
            fieldMap.set(field.key.toLowerCase(), field);
        }

        // 3. Strict Validation: Disallow unknown keys
        const payloadKeys = Object.keys(payload || {});
        for (const key of payloadKeys) {
            const lowerKey = key.toLowerCase();
            if (!fieldMap.has(lowerKey)) {
                throw new AppError(
                    `Unknown field '${key}'. This property is not configured for form '${slug}'.`,
                    "UNKNOWN_FORM_FIELD",
                    400
                );
            }
        }

        // 4. Validate required fields and data types
        const sanitizedData: Record<string, any> = {};

        for (const field of fields) {
            const rawVal = payload[field.key];
            const isProvided = rawVal !== undefined && rawVal !== null && rawVal !== "";

            if (field.isRequired && !isProvided) {
                throw new AppError(
                    `Field '${field.label}' (${field.key}) is required.`,
                    "REQUIRED_FIELD_MISSING",
                    400
                );
            }

            if (isProvided) {
                sanitizedData[field.key] = this.validateAndTransformFieldValue(field, rawVal);
            }
        }

        // 5. Contact Resolution (identify email and name fields to automatically create/link Contact)
        let contactId: string | null = null;
        const email = this.extractEmail(sanitizedData);

        if (email) {
            const firstName =
                sanitizedData.first_name ||
                sanitizedData.firstName ||
                sanitizedData.name ||
                sanitizedData.nombre ||
                null;
            const lastName =
                sanitizedData.last_name ||
                sanitizedData.lastName ||
                sanitizedData.apellido ||
                null;
            const phone =
                sanitizedData.phone ||
                sanitizedData.telefono ||
                sanitizedData.cellphone ||
                null;

            const contact = await this.contactsRepository.findOrCreate({
                websiteId,
                email,
                firstName: typeof firstName === "string" ? firstName : null,
                lastName: typeof lastName === "string" ? lastName : null,
                phone: typeof phone === "string" ? phone : null,
            });

            contactId = contact.id;
        }

        // 6. Create FormSubmission
        const submission = await this.formSubmissionsRepository.create({
            formId: form.id,
            contactId,
            data: sanitizedData,
            status: "PENDING",
        });

        // 7. Email Notifications Workflow (if enabled on the form)
        if (form.sendEmail && this.emailProvider && this.emailTemplatesRepository) {
            await this.handleFormEmailNotification(form, submission, sanitizedData);
        }

        return submission;
    }

    private async handleFormEmailNotification(
        form: any,
        submission: FormSubmissionEntity,
        data: Record<string, any>
    ): Promise<void> {
        try {
            // Check recipients
            const recipients = Array.isArray(form.recipientEmails)
                ? form.recipientEmails.filter((e: string) => typeof e === 'string' && e.includes('@'))
                : [];

            if (recipients.length === 0) {
                Logger.warn(`[SubmitPublicFormUseCase] Form '${form.name}' (${form.id}) has sendEmail enabled but has no valid recipient emails.`);
                return;
            }

            // Check email template association
            if (!form.emailTemplateId) {
                Logger.warn(`[SubmitPublicFormUseCase] Form '${form.name}' (${form.id}) has sendEmail enabled but no emailTemplateId configured.`);
                return;
            }

            const template = await this.emailTemplatesRepository!.findById(form.emailTemplateId);
            if (!template) {
                Logger.warn(`[SubmitPublicFormUseCase] Associated EmailTemplate '${form.emailTemplateId}' not found for form '${form.id}'.`);
                return;
            }

            // Enforce multi-tenant scoping: EmailTemplate must belong to the exact same website
            if (template.websiteId !== form.websiteId) {
                Logger.error(`[SubmitPublicFormUseCase] Security violation: EmailTemplate '${template.id}' (website: ${template.websiteId}) does not belong to form website '${form.websiteId}'. Email sending aborted.`);
                return;
            }

            // Resolve website details for template variables and sender name formatting
            const website = this.websitesRepository
                ? await this.websitesRepository.findById(form.websiteId)
                : null;

            const cleanDomain = website?.domain
                ? website.domain.replace(/^https?:\/\//, '').split('/')[0]?.trim() || ''
                : '';
            const logoUrl = cleanDomain
                ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanDomain)}&sz=128`
                : '';

            const templateContext: Record<string, any> = {
                ...data,
                websiteName: website?.name || '',
                website_name: website?.name || '',
                websiteDomain: cleanDomain,
                website_domain: cleanDomain,
                websiteLogo: logoUrl,
                website_logo: logoUrl,
                formName: form.name,
                form_name: form.name,
                year: new Date().getFullYear(),
            };

            // Safe dynamic template interpolation
            const subject = TemplateRenderer.render(template.subject, templateContext) || `New Form Submission: ${form.name}`;
            const html = TemplateRenderer.render(template.htmlContent, templateContext);

            let formattedFrom: string | undefined = undefined;
            const senderName = website?.name ? website.name.replace(/[<>"\\]/g, '').trim() : '';

            let originEmail = '';
            if (form.emailFrom && form.emailFrom.trim()) {
                const rawFrom = form.emailFrom.trim();
                const match = rawFrom.match(/<([^>]+)>/);
                originEmail = match ? match[1].trim() : rawFrom;
            } else if (cleanDomain) {
                originEmail = `noresponder@${cleanDomain}`;
            }

            if (senderName && originEmail) {
                formattedFrom = `${senderName} <${originEmail}>`;
            } else if (originEmail) {
                formattedFrom = originEmail;
            } else if (senderName) {
                formattedFrom = senderName;
            }

            // Dispatch via decoupled IEmailProvider
            const result = await this.emailProvider!.sendEmail({
                from: formattedFrom,
                to: recipients,
                subject,
                html,
            });

            if (!result.success) {
                Logger.error(`[SubmitPublicFormUseCase] Email notification failed for submission '${submission.id}': ${result.error}`, {
                    formId: form.id,
                    recipients,
                    error: result.error,
                });
            } else {
                Logger.info(`[SubmitPublicFormUseCase] Email notification successfully dispatched for submission '${submission.id}'`, {
                    formId: form.id,
                    messageId: result.messageId,
                    recipients,
                });
            }
        } catch (err: any) {
            // Failure to send email MUST NOT cancel or delete the persisted submission
            Logger.error(`[SubmitPublicFormUseCase] Unexpected error in email notification workflow for submission '${submission.id}'`, err, {
                formId: form.id,
            });
        }
    }

    private validateAndTransformFieldValue(field: FormFieldEntity, val: any): any {
        switch (field.type) {
            case "STRING":
            case "TEXT":
                if (typeof val !== "string" && typeof val !== "number") {
                    throw new AppError(
                        `Field '${field.key}' must be text.`,
                        "INVALID_FIELD_TYPE",
                        400
                    );
                }
                return String(val).trim();

            case "NUMBER":
                const num = Number(val);
                if (isNaN(num)) {
                    throw new AppError(
                        `Field '${field.key}' must be a valid number.`,
                        "INVALID_FIELD_TYPE",
                        400
                    );
                }
                return num;

            case "BOOLEAN":
                if (typeof val === "boolean") return val;
                if (val === "true" || val === 1 || val === "1") return true;
                if (val === "false" || val === 0 || val === "0") return false;
                throw new AppError(
                    `Field '${field.key}' must be a boolean (true/false).`,
                    "INVALID_FIELD_TYPE",
                    400
                );

            case "DATE":
                const date = new Date(val);
                if (isNaN(date.getTime())) {
                    throw new AppError(
                        `Field '${field.key}' must be a valid date format.`,
                        "INVALID_FIELD_TYPE",
                        400
                    );
                }
                return date.toISOString();

            case "URL":
                if (typeof val !== "string") {
                    throw new AppError(
                        `Field '${field.key}' must be a valid URL string.`,
                        "INVALID_FIELD_TYPE",
                        400
                    );
                }
                try {
                    new URL(val.trim());
                    return val.trim();
                } catch {
                    throw new AppError(
                        `Field '${field.key}' contains an invalid URL format.`,
                        "INVALID_URL_FORMAT",
                        400
                    );
                }

            case "JSON":
                if (typeof val === "object" && val !== null) return val;
                if (typeof val === "string") {
                    try {
                        return JSON.parse(val);
                    } catch {
                        throw new AppError(
                            `Field '${field.key}' must be a valid JSON object or array.`,
                            "INVALID_JSON_FORMAT",
                            400
                        );
                    }
                }
                throw new AppError(
                    `Field '${field.key}' must be a valid JSON object or array.`,
                    "INVALID_FIELD_TYPE",
                    400
                );

            default:
                return val;
        }
    }

    private extractEmail(data: Record<string, any>): string | null {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Check common email key names first
        const candidateKeys = ["email", "e_mail", "correo", "correo_electronico", "user_email", "contact_email"];
        for (const key of candidateKeys) {
            const val = data[key];
            if (typeof val === "string" && emailRegex.test(val.trim())) {
                return val.trim().toLowerCase();
            }
        }

        // Search through all properties if no exact key matched
        for (const [_, val] of Object.entries(data)) {
            if (typeof val === "string" && emailRegex.test(val.trim())) {
                return val.trim().toLowerCase();
            }
        }

        return null;
    }
}
