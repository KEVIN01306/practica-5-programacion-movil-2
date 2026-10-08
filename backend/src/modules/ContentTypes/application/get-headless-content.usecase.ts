import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type { ContentFieldsRepository } from "../domain/content-fields.repository.js";
import type { ContentItemsRepository } from "../domain/content-items.repository.js";
import type { ContentFieldEntity } from "../domain/content-field.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export interface HeadlessContentQueryInput {
    websiteId: string;
    contentTypeSlug: string;
    page?: number;
    limit?: number;
    includeSchema?: boolean;
    filters?: Record<string, any>;
}

export interface HeadlessContentResponse {
    contentType: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
    };
    schema?: Array<{
        name: string;
        key: string;
        type: string;
        isRequired: boolean;
    }>;
    filtersApplied?: Record<string, any>;
    items: Array<{
        id: string;
        data: Record<string, any>;
        createdAt: Date;
        updatedAt: Date;
    }>;
    meta: {
        total: number;
        limit: number;
        page: number;
    };
}

export class GetHeadlessContentUseCase {
    constructor(
        private readonly contentTypesRepository: ContentTypesRepository,
        private readonly contentFieldsRepository: ContentFieldsRepository,
        private readonly contentItemsRepository: ContentItemsRepository
    ) {}

    async execute(input: HeadlessContentQueryInput): Promise<HeadlessContentResponse> {
        try {
            // 1. Locate the content type under the authenticated website
            const contentType = await this.contentTypesRepository.findBySlug(
                input.websiteId,
                input.contentTypeSlug
            );

            if (!contentType) {
                throw new AppError(
                    `Content type "${input.contentTypeSlug}" was not found for this website.`,
                    "CONTENT_TYPE_NOT_FOUND",
                    404
                );
            }

            // 2. Fetch defined schema fields for this content type
            const fields = await this.contentFieldsRepository.listByContentType(contentType.id);
            const fieldMap = new Map<string, ContentFieldEntity>(
                fields.map((f) => [f.key, f])
            );

            // 3. Validate and sanitize custom field filters
            const validatedFieldFilters: Record<string, any> = {};

            if (input.filters && Object.keys(input.filters).length > 0) {
                for (const [paramKey, rawVal] of Object.entries(input.filters)) {
                    if (rawVal === undefined || rawVal === null || rawVal === '') continue;

                    // Strictly check that the filter key corresponds to a defined schema field
                    const fieldDef = fieldMap.get(paramKey);
                    if (!fieldDef) {
                        const validKeys = fields.map((f) => `'${f.key}'`).join(', ');
                        throw new AppError(
                            `Invalid filter parameter '${paramKey}'. Available fields for '${contentType.slug}' are: [${validKeys || 'none'}].`,
                            "INVALID_FILTER_PARAM",
                            400
                        );
                    }

                    // Cast and validate value according to the field data type
                    let castValue: any = rawVal;

                    if (fieldDef.type === 'NUMBER') {
                        const num = Number(rawVal);
                        if (isNaN(num)) {
                            throw new AppError(
                                `Filter value for '${paramKey}' must be a valid number (received '${rawVal}').`,
                                "INVALID_FILTER_TYPE",
                                400
                            );
                        }
                        castValue = num;
                    } else if (fieldDef.type === 'BOOLEAN') {
                        if (rawVal === 'true' || rawVal === '1' || rawVal === true) {
                            castValue = true;
                        } else if (rawVal === 'false' || rawVal === '0' || rawVal === false) {
                            castValue = false;
                        } else {
                            throw new AppError(
                                `Filter value for '${paramKey}' must be a boolean ('true' or 'false').`,
                                "INVALID_FILTER_TYPE",
                                400
                            );
                        }
                    } else if (fieldDef.type === 'JSON') {
                        try {
                            if (typeof rawVal === 'string') {
                                castValue = JSON.parse(rawVal);
                            }
                        } catch {
                            castValue = rawVal;
                        }
                    }

                    validatedFieldFilters[paramKey] = castValue;
                }
            }

            const page = Math.max(1, input.page || 1);
            const limit = Math.min(100, Math.max(1, input.limit || 20));

            // 4. Fetch published items matching the validated field filters
            const itemsResult = await this.contentItemsRepository.list({
                page,
                limit,
                filters: {
                    contentTypeId: contentType.id,
                    isPublished: true,
                    fieldFilters: validatedFieldFilters,
                },
            });

            return {
                contentType: {
                    id: contentType.id,
                    name: contentType.name,
                    slug: contentType.slug,
                    description: contentType.description,
                },
                ...(input.includeSchema
                    ? {
                          schema: fields.map((f) => ({
                              name: f.name,
                              key: f.key,
                              type: f.type,
                              isRequired: f.isRequired,
                          })),
                      }
                    : {}),
                ...(Object.keys(validatedFieldFilters).length > 0
                    ? { filtersApplied: validatedFieldFilters }
                    : {}),
                items: itemsResult.data.map((item) => ({
                    id: item.id,
                    data: item.data,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                })),
                meta: {
                    total: itemsResult.total,
                    limit,
                    page,
                },
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error("GetHeadlessContentUseCase error:", error);
            const message = error instanceof Error ? error.message : "Failed to fetch headless content";
            throw new AppError(message, "HEADLESS_CONTENT_ERROR", 500);
        }
    }
}
