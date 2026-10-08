import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type { UpdateContentTypeInput, ContentTypeEntity } from "../domain/content-type.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";
import { UniqueConstraintError } from "../../../shared/db/database/errors/UniqueConstraintError.js";

export class UpdateContentTypeUseCase {
    constructor(
        private readonly contentTypesRepository: ContentTypesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        id: string,
        input: UpdateContentTypeInput,
        auditContext?: AuditContext
    ): Promise<ContentTypeEntity> {
        try {
            const existing = await this.contentTypesRepository.findById(id);
            if (!existing) {
                throw new AppError("Content Type not found", "CONTENT_TYPE_NOT_FOUND", 404);
            }

            if (input.slug !== undefined) {
                const normalizedSlug = input.slug.toLowerCase().trim();
                if (normalizedSlug !== existing.slug) {
                    const slugExists = await this.contentTypesRepository.findBySlug(
                        existing.websiteId,
                        normalizedSlug
                    );
                    if (slugExists && slugExists.id !== id) {
                        throw new AppError(
                            "A Content Type with this slug already exists for this website",
                            "CONTENT_TYPE_SLUG_ALREADY_EXISTS",
                            409
                        );
                    }
                }
            }

            const updated = await this.contentTypesRepository.update(id, input);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "content_types",
                resourceId: updated.id,
                userId: auditContext?.userId,
                context: auditContext,
                before: existing,
                after: updated,
                details: {
                    websiteId: updated.websiteId,
                    name: updated.name,
                    slug: updated.slug,
                },
            });

            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof UniqueConstraintError) {
                throw new AppError(
                    "A Content Type with this slug already exists for this website",
                    "CONTENT_TYPE_CONFLICT",
                    409
                );
            }
            throw new AppError("Failed to update content type", "UPDATE_CONTENT_TYPE_ERROR", 500);
        }
    }
}
