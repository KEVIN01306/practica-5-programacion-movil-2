import { PrismaClient } from "@prisma/client";
import { PrismaContentTypesRepository } from "./infrastructure/prisma-content-types.repository.js";
import { PrismaContentFieldsRepository } from "./infrastructure/prisma-content-fields.repository.js";
import { PrismaContentItemsRepository } from "./infrastructure/prisma-content-items.repository.js";

import { CreateContentTypeUseCase } from "./application/create-content-type.usecase.js";
import { GetContentTypeUseCase } from "./application/get-content-type.usecase.js";
import { ListContentTypesUseCase } from "./application/list-content-types.usecase.js";
import { UpdateContentTypeUseCase } from "./application/update-content-type.usecase.js";
import { DeleteContentTypeUseCase } from "./application/delete-content-type.usecase.js";

import { CreateContentFieldUseCase } from "./application/create-content-field.usecase.js";
import { GetContentFieldUseCase } from "./application/get-content-field.usecase.js";
import { ListContentFieldsUseCase } from "./application/list-content-fields.usecase.js";
import { UpdateContentFieldUseCase } from "./application/update-content-field.usecase.js";
import { DeleteContentFieldUseCase } from "./application/delete-content-field.usecase.js";

import { CreateContentItemUseCase } from "./application/create-content-item.usecase.js";
import { GetContentItemUseCase } from "./application/get-content-item.usecase.js";
import { ListContentItemsUseCase } from "./application/list-content-items.usecase.js";
import { UpdateContentItemUseCase } from "./application/update-content-item.usecase.js";
import { DeleteContentItemUseCase } from "./application/delete-content-item.usecase.js";

import { ContentTypesController } from "./presentation/content-types.controller.js";
import { ContentFieldsController } from "./presentation/content-fields.controller.js";
import { ContentItemsController } from "./presentation/content-items.controller.js";

import { websitesRepository } from "../Websites/websites.module.js";
import { auditLogService } from "../Audit/audit.module.js";

const prisma = new PrismaClient();

export const contentTypesRepository = new PrismaContentTypesRepository(prisma);
export const contentFieldsRepository = new PrismaContentFieldsRepository(prisma);
export const contentItemsRepository = new PrismaContentItemsRepository(prisma);

// Content Type Use Cases
export const createContentTypeUseCase = new CreateContentTypeUseCase(
    contentTypesRepository,
    websitesRepository,
    auditLogService
);
export const getContentTypeUseCase = new GetContentTypeUseCase(contentTypesRepository);
export const listContentTypesUseCase = new ListContentTypesUseCase(
    contentTypesRepository,
    websitesRepository
);
export const updateContentTypeUseCase = new UpdateContentTypeUseCase(
    contentTypesRepository,
    auditLogService
);
export const deleteContentTypeUseCase = new DeleteContentTypeUseCase(
    contentTypesRepository,
    auditLogService
);

// Content Field Use Cases
export const createContentFieldUseCase = new CreateContentFieldUseCase(
    contentFieldsRepository,
    contentTypesRepository,
    auditLogService
);
export const getContentFieldUseCase = new GetContentFieldUseCase(contentFieldsRepository);
export const listContentFieldsUseCase = new ListContentFieldsUseCase(
    contentFieldsRepository,
    contentTypesRepository
);
export const updateContentFieldUseCase = new UpdateContentFieldUseCase(
    contentFieldsRepository,
    auditLogService
);
export const deleteContentFieldUseCase = new DeleteContentFieldUseCase(
    contentFieldsRepository,
    auditLogService
);

import { BulkCreateContentFieldsUseCase } from "./application/bulk-create-content-fields.usecase.js";
import { BulkCreateContentItemsUseCase } from "./application/bulk-create-content-items.usecase.js";
import { GetHeadlessContentUseCase } from "./application/get-headless-content.usecase.js";
import { HeadlessContentController } from "./presentation/headless-content.controller.js";

export const bulkCreateContentFieldsUseCase = new BulkCreateContentFieldsUseCase(
    contentFieldsRepository,
    contentTypesRepository,
    auditLogService
);

// Content Item Use Cases
export const createContentItemUseCase = new CreateContentItemUseCase(
    contentItemsRepository,
    contentTypesRepository,
    contentFieldsRepository,
    auditLogService
);
export const bulkCreateContentItemsUseCase = new BulkCreateContentItemsUseCase(
    contentItemsRepository,
    contentTypesRepository,
    contentFieldsRepository,
    auditLogService
);
export const getContentItemUseCase = new GetContentItemUseCase(contentItemsRepository);
export const listContentItemsUseCase = new ListContentItemsUseCase(
    contentItemsRepository,
    contentTypesRepository
);
export const updateContentItemUseCase = new UpdateContentItemUseCase(
    contentItemsRepository,
    contentFieldsRepository,
    auditLogService
);
export const deleteContentItemUseCase = new DeleteContentItemUseCase(
    contentItemsRepository,
    auditLogService
);

// Headless Use Cases
export const getHeadlessContentUseCase = new GetHeadlessContentUseCase(
    contentTypesRepository,
    contentFieldsRepository,
    contentItemsRepository
);

// Controllers
export const contentTypesController = new ContentTypesController(
    createContentTypeUseCase,
    getContentTypeUseCase,
    listContentTypesUseCase,
    updateContentTypeUseCase,
    deleteContentTypeUseCase
);

export const contentFieldsController = new ContentFieldsController(
    createContentFieldUseCase,
    getContentFieldUseCase,
    listContentFieldsUseCase,
    updateContentFieldUseCase,
    deleteContentFieldUseCase,
    bulkCreateContentFieldsUseCase
);

export const contentItemsController = new ContentItemsController(
    createContentItemUseCase,
    bulkCreateContentItemsUseCase,
    getContentItemUseCase,
    listContentItemsUseCase,
    updateContentItemUseCase,
    deleteContentItemUseCase
);

export const headlessContentController = new HeadlessContentController(
    getHeadlessContentUseCase,
    listContentTypesUseCase,
    getContentItemUseCase
);
