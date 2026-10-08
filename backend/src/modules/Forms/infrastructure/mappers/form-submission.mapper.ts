import type {
    FormSubmission as PrismaFormSubmission,
    Contact as PrismaContact,
    Form as PrismaForm,
} from "@prisma/client";
import type { FormSubmissionEntity } from "../../domain/form-submission.entity.js";

type PrismaSubmissionWithRelations = PrismaFormSubmission & {
    contact?: PrismaContact | null;
    form?: PrismaForm;
};

export class FormSubmissionMapper {
    static toDomain(raw: PrismaSubmissionWithRelations): FormSubmissionEntity {
        let parsedData: Record<string, any> = {};
        if (raw.data && typeof raw.data === "object") {
            parsedData = raw.data as Record<string, any>;
        }

        return {
            id: raw.id,
            formId: raw.formId,
            contactId: raw.contactId,
            data: parsedData,
            status: raw.status,
            createdAt: raw.createdAt,
            contact: raw.contact
                ? {
                      id: raw.contact.id,
                      email: raw.contact.email,
                      firstName: raw.contact.firstName,
                      lastName: raw.contact.lastName,
                      phone: raw.contact.phone,
                  }
                : null,
            form: raw.form
                ? {
                      id: raw.form.id,
                      name: raw.form.name,
                      slug: raw.form.slug,
                      websiteId: raw.form.websiteId,
                  }
                : undefined,
        };
    }
}
