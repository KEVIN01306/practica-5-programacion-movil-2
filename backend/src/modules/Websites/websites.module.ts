import { PrismaClient } from "@prisma/client";
import { PrismaWebsitesRepository } from "./infrastructure/prisma-websites.repository.js";
import { CreateWebsiteUseCase } from "./application/create-website.usecase.js";
import { GetWebsiteUseCase } from "./application/get-website.usecase.js";
import { ListWebsitesUseCase } from "./application/list-websites.usecase.js";
import { UpdateWebsiteUseCase } from "./application/update-website.usecase.js";
import { DeleteWebsiteUseCase } from "./application/delete-website.usecase.js";
import { RegenerateApiKeyUseCase } from "./application/regenerate-api-key.usecase.js";
import { WebsitesController } from "./presentation/websites.controller.js";
import { auditLogService } from "../Audit/audit.module.js";

const prisma = new PrismaClient();

export const websitesRepository = new PrismaWebsitesRepository(prisma);

export const createWebsiteUseCase = new CreateWebsiteUseCase(websitesRepository, auditLogService);
export const getWebsiteUseCase = new GetWebsiteUseCase(websitesRepository);
export const listWebsitesUseCase = new ListWebsitesUseCase(websitesRepository);
export const updateWebsiteUseCase = new UpdateWebsiteUseCase(websitesRepository, auditLogService);
export const deleteWebsiteUseCase = new DeleteWebsiteUseCase(websitesRepository, auditLogService);
export const regenerateApiKeyUseCase = new RegenerateApiKeyUseCase(websitesRepository, auditLogService);

export const websitesController = new WebsitesController(
    createWebsiteUseCase,
    getWebsiteUseCase,
    listWebsitesUseCase,
    updateWebsiteUseCase,
    deleteWebsiteUseCase,
    regenerateApiKeyUseCase
);
