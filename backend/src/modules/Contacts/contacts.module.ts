import { PrismaClient } from "@prisma/client";
import { PrismaContactsRepository } from "./infrastructure/prisma-contacts.repository.js";
import { ListContactsUseCase } from "./application/list-contacts.usecase.js";
import { GetContactUseCase } from "./application/get-contact.usecase.js";
import { CreateContactUseCase } from "./application/create-contact.usecase.js";
import { UpdateContactUseCase } from "./application/update-contact.usecase.js";
import { DeleteContactUseCase } from "./application/delete-contact.usecase.js";
import { ContactsController } from "./presentation/contacts.controller.js";
import { websitesRepository } from "../Websites/websites.module.js";
import { auditLogService } from "../Audit/audit.module.js";

const prisma = new PrismaClient();

export const contactsRepository = new PrismaContactsRepository(prisma);

export const listContactsUseCase = new ListContactsUseCase(contactsRepository);
export const getContactUseCase = new GetContactUseCase(contactsRepository);
export const createContactUseCase = new CreateContactUseCase(
    contactsRepository,
    websitesRepository,
    auditLogService
);
export const updateContactUseCase = new UpdateContactUseCase(
    contactsRepository,
    auditLogService
);
export const deleteContactUseCase = new DeleteContactUseCase(
    contactsRepository,
    auditLogService
);

export const contactsController = new ContactsController(
    listContactsUseCase,
    getContactUseCase,
    createContactUseCase,
    updateContactUseCase,
    deleteContactUseCase
);
