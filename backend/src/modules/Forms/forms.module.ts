import { PrismaClient } from "@prisma/client";
import { PrismaFormsRepository } from "./infrastructure/prisma-forms.repository.js";
import { PrismaFormFieldsRepository } from "./infrastructure/prisma-form-fields.repository.js";
import { PrismaFormSubmissionsRepository } from "./infrastructure/prisma-form-submissions.repository.js";
import { PrismaContactsRepository } from "./infrastructure/prisma-contacts.repository.js";

import { CreateFormUseCase } from "./application/create-form.usecase.js";
import { GetFormUseCase } from "./application/get-form.usecase.js";
import { ListFormsUseCase } from "./application/list-forms.usecase.js";
import { UpdateFormUseCase } from "./application/update-form.usecase.js";
import { DeleteFormUseCase } from "./application/delete-form.usecase.js";

import { CreateFormFieldUseCase } from "./application/create-form-field.usecase.js";
import { GetFormFieldUseCase } from "./application/get-form-field.usecase.js";
import { ListFormFieldsUseCase } from "./application/list-form-fields.usecase.js";
import { UpdateFormFieldUseCase } from "./application/update-form-field.usecase.js";
import { DeleteFormFieldUseCase } from "./application/delete-form-field.usecase.js";
import { BulkCreateFormFieldsUseCase } from "./application/bulk-create-form-fields.usecase.js";

import { ListFormSubmissionsUseCase } from "./application/list-form-submissions.usecase.js";
import { GetFormSubmissionUseCase } from "./application/get-form-submission.usecase.js";
import { UpdateFormSubmissionStatusUseCase } from "./application/update-form-submission-status.usecase.js";
import { DeleteFormSubmissionUseCase } from "./application/delete-form-submission.usecase.js";
import { SubmitPublicFormUseCase } from "./application/submit-public-form.usecase.js";

import { FormsController } from "./presentation/forms.controller.js";
import { FormFieldsController } from "./presentation/form-fields.controller.js";
import { FormSubmissionsController } from "./presentation/form-submissions.controller.js";
import { PublicFormsController } from "./presentation/public-forms.controller.js";

import { websitesRepository } from "../Websites/websites.module.js";
import { emailTemplatesRepository } from "../EmailTemplates/email-templates.module.js";
import { auditLogService } from "../Audit/audit.module.js";
import { emailProvider } from "../Email/email.module.js";

const prisma = new PrismaClient();

// Repositories
export const formsRepository = new PrismaFormsRepository(prisma);
export const formFieldsRepository = new PrismaFormFieldsRepository(prisma);
export const formSubmissionsRepository = new PrismaFormSubmissionsRepository(prisma);
export const contactsRepository = new PrismaContactsRepository(prisma);

// Form Use Cases
export const createFormUseCase = new CreateFormUseCase(
    formsRepository,
    websitesRepository,
    emailTemplatesRepository,
    auditLogService
);
export const getFormUseCase = new GetFormUseCase(formsRepository);
export const listFormsUseCase = new ListFormsUseCase(formsRepository, websitesRepository);
export const updateFormUseCase = new UpdateFormUseCase(
    formsRepository,
    websitesRepository,
    emailTemplatesRepository,
    auditLogService
);
export const deleteFormUseCase = new DeleteFormUseCase(formsRepository, auditLogService);

// Form Field Use Cases
export const createFormFieldUseCase = new CreateFormFieldUseCase(
    formFieldsRepository,
    formsRepository,
    auditLogService
);
export const getFormFieldUseCase = new GetFormFieldUseCase(formFieldsRepository);
export const listFormFieldsUseCase = new ListFormFieldsUseCase(
    formFieldsRepository,
    formsRepository
);
export const updateFormFieldUseCase = new UpdateFormFieldUseCase(
    formFieldsRepository,
    auditLogService
);
export const deleteFormFieldUseCase = new DeleteFormFieldUseCase(
    formFieldsRepository,
    auditLogService
);
export const bulkCreateFormFieldsUseCase = new BulkCreateFormFieldsUseCase(
    formFieldsRepository,
    formsRepository,
    auditLogService
);

// Form Submission Use Cases
export const listFormSubmissionsUseCase = new ListFormSubmissionsUseCase(
    formSubmissionsRepository,
    formsRepository
);
export const getFormSubmissionUseCase = new GetFormSubmissionUseCase(formSubmissionsRepository);
export const updateFormSubmissionStatusUseCase = new UpdateFormSubmissionStatusUseCase(
    formSubmissionsRepository,
    auditLogService
);
export const deleteFormSubmissionUseCase = new DeleteFormSubmissionUseCase(
    formSubmissionsRepository,
    auditLogService
);
export const submitPublicFormUseCase = new SubmitPublicFormUseCase(
    formsRepository,
    formFieldsRepository,
    formSubmissionsRepository,
    contactsRepository,
    emailTemplatesRepository,
    emailProvider,
    websitesRepository
);

// Controllers
export const formsController = new FormsController(
    createFormUseCase,
    getFormUseCase,
    listFormsUseCase,
    updateFormUseCase,
    deleteFormUseCase
);

export const formFieldsController = new FormFieldsController(
    createFormFieldUseCase,
    getFormFieldUseCase,
    listFormFieldsUseCase,
    updateFormFieldUseCase,
    deleteFormFieldUseCase,
    bulkCreateFormFieldsUseCase
);

export const formSubmissionsController = new FormSubmissionsController(
    listFormSubmissionsUseCase,
    getFormSubmissionUseCase,
    updateFormSubmissionStatusUseCase,
    deleteFormSubmissionUseCase
);

export const publicFormsController = new PublicFormsController(submitPublicFormUseCase);
