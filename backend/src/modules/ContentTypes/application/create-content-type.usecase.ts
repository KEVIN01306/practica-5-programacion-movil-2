import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type { WebsitesRepository } from "../../Websites/domain/websites.repository.js";
import type { CreateContentTypeInput, ContentTypeEntity } from "../domain/content-type.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";
import { UniqueConstraintError } from "../../../shared/db/database/errors/UniqueConstraintError.js";

export class CreateContentTypeUseCase {
    constructor(
        private readonly contentTypesRepository: ContentTypesRepository,
        private readonly websitesRepository: WebsitesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        input: CreateContentTypeInput,
        auditContext?: AuditContext
    ): Promise<ContentTypeEntity> {
        try {
            // 1. Verify Website exists
            const website = await this.websitesRepository.findById(input.websiteId);
            if (!website) {
                throw new AppError("Website not found", "WEBSITE_NOT_FOUND", 404);
            }

            const normalizedSlug = input.slug.toLowerCase().trim();

            // 2. Validate slug uniqueness within website
            const existingContentType = await this.contentTypesRepository.findBySlug(
                input.websiteId,
                normalizedSlug
            );
            if (existingContentType) {
                throw new AppError(
                    "A Content Type with this slug already exists for this website",
                    "CONTENT_TYPE_SLUG_ALREADY_EXISTS",
                    409
                );
            }

            // 3. Create ContentType
            const contentType = await this.contentTypesRepository.create({
                websiteId: input.websiteId,
                name: input.name.trim(),
                slug: normalizedSlug,
                description: input.description?.trim() ?? null,
            });

            // 4. Record Audit Log
            await this.auditLogService.record({
                action: "CREATE",
                resource: "content_types",
                resourceId: contentType.id,
                userId: auditContext?.userId,
                context: auditContext,
                after: contentType,
                details: {
                    websiteId: contentType.websiteId,
                    name: contentType.name,
                    slug: contentType.slug,
                },
            });

            return contentType;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof UniqueConstraintError) {
                throw new AppError(
                    "A Content Type with this slug already exists for this website",
                    "CONTENT_TYPE_CONFLICT",
                    409
                );
            }
            throw new AppError("Failed to create content type", "CREATE_CONTENT_TYPE_ERROR", 500);
        }
    }
}
