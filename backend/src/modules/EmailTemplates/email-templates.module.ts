import { PrismaClient } from "@prisma/client";
import { PrismaEmailTemplatesRepository } from "./infrastructure/prisma-email-templates.repository.js";
import { CreateEmailTemplateUseCase } from "./application/create-email-template.usecase.js";
import { GetEmailTemplateUseCase } from "./application/get-email-template.usecase.js";
import { ListEmailTemplatesUseCase } from "./application/list-email-templates.usecase.js";
import { UpdateEmailTemplateUseCase } from "./application/update-email-template.usecase.js";
import { DeleteEmailTemplateUseCase } from "./application/delete-email-template.usecase.js";
import { EmailTemplatesController } from "./presentation/email-templates.controller.js";
import { websitesRepository } from "../Websites/websites.module.js";
import { auditLogService } from "../Audit/audit.module.js";

const prisma = new PrismaClient();

export const emailTemplatesRepository = new PrismaEmailTemplatesRepository(prisma);

export const createEmailTemplateUseCase = new CreateEmailTemplateUseCase(
    emailTemplatesRepository,
    websitesRepository,
    auditLogService
);

export const getEmailTemplateUseCase = new GetEmailTemplateUseCase(emailTemplatesRepository);

export const listEmailTemplatesUseCase = new ListEmailTemplatesUseCase(
    emailTemplatesRepository,
    websitesRepository
);

export const updateEmailTemplateUseCase = new UpdateEmailTemplateUseCase(
    emailTemplatesRepository,
    auditLogService
);

export const deleteEmailTemplateUseCase = new DeleteEmailTemplateUseCase(
    emailTemplatesRepository,
    auditLogService
);

export const emailTemplatesController = new EmailTemplatesController(
    createEmailTemplateUseCase,
    getEmailTemplateUseCase,
    listEmailTemplatesUseCase,
    updateEmailTemplateUseCase,
    deleteEmailTemplateUseCase
);
