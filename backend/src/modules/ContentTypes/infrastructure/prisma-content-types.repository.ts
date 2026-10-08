import type { PrismaClient, Prisma } from "@prisma/client";
import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type {
    ContentTypeEntity,
    CreateContentTypeInput,
    UpdateContentTypeInput,
    ListContentTypesFilters,
} from "../domain/content-type.entity.js";
import { ContentTypeMapper } from "./mappers/content-type.mapper.js";
import { PrismaErrorMapper } from "../../../shared/db/database/prisma/PrismaErrorMapper.js";

export class PrismaContentTypesRepository implements ContentTypesRepository {
    constructor(private readonly prisma: PrismaClient) {}

    private readonly defaultInclude = {
        _count: {
            select: {
                fields: true,
                items: true,
            },
        },
    };

    async create(data: CreateContentTypeInput): Promise<ContentTypeEntity> {
        try {
            const created = await this.prisma.contentType.create({
                data: {
                    websiteId: data.websiteId,
                    name: data.name.trim(),
                    slug: data.slug.toLowerCase().trim(),
                    description: data.description?.trim() ?? null,
                },
                include: this.defaultInclude,
            });
            return ContentTypeMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<ContentTypeEntity | null> {
        try {
            const found = await this.prisma.contentType.findUnique({
                where: { id },
                include: this.defaultInclude,
            });
            return found ? ContentTypeMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findBySlug(websiteId: string, slug: string): Promise<ContentTypeEntity | null> {
        try {
            const found = await this.prisma.contentType.findUnique({
                where: {
                    websiteId_slug: {
                        websiteId,
                        slug: slug.toLowerCase().trim(),
                    },
                },
                include: this.defaultInclude,
            });
            return found ? ContentTypeMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async list(params: {
        page?: number;
        limit?: number;
        filters?: ListContentTypesFilters;
    }): Promise<{ data: ContentTypeEntity[]; total: number }> {
        try {
            const page = Math.max(1, params.page || 1);
            const limit = Math.max(1, params.limit || 10);
            const skip = (page - 1) * limit;

            const where: Prisma.ContentTypeWhereInput = {};

            if (params.filters) {
                if (params.filters.websiteId) {
                    where.websiteId = params.filters.websiteId;
                }

                if (params.filters.search && params.filters.search.trim() !== "") {
                    const search = params.filters.search.trim();
                    where.OR = [
                        { name: { contains: search } },
                        { slug: { contains: search } },
                        { description: { contains: search } },
                    ];
                }
            }

            const [total, items] = await Promise.all([
                this.prisma.contentType.count({ where }),
                this.prisma.contentType.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: this.defaultInclude,
                }),
            ]);

            return {
                data: items.map(ContentTypeMapper.toDomain),
                total,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateContentTypeInput): Promise<ContentTypeEntity> {
        try {
            const updateData: Prisma.ContentTypeUpdateInput = {};

            if (data.name !== undefined) updateData.name = data.name.trim();
            if (data.slug !== undefined) updateData.slug = data.slug.toLowerCase().trim();
            if (data.description !== undefined) {
                updateData.description = data.description ? data.description.trim() : null;
            }

            const updated = await this.prisma.contentType.update({
                where: { id },
                data: updateData,
                include: this.defaultInclude,
            });

            return ContentTypeMapper.toDomain(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.contentType.delete({
                where: { id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async countByWebsite(websiteId: string): Promise<number> {
        try {
            return await this.prisma.contentType.count({
                where: { websiteId },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
