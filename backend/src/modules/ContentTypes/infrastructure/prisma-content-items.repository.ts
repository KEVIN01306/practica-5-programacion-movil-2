import type { PrismaClient, Prisma } from "@prisma/client";
import type { ContentItemsRepository } from "../domain/content-items.repository.js";
import type {
    ContentItemEntity,
    CreateContentItemInput,
    UpdateContentItemInput,
    ListContentItemsFilters,
} from "../domain/content-item.entity.js";
import { ContentItemMapper } from "./mappers/content-item.mapper.js";
import { PrismaErrorMapper } from "../../../shared/db/database/prisma/PrismaErrorMapper.js";

export class PrismaContentItemsRepository implements ContentItemsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateContentItemInput): Promise<ContentItemEntity> {
        try {
            const created = await this.prisma.contentItem.create({
                data: {
                    contentTypeId: data.contentTypeId,
                    data: data.data as Prisma.InputJsonValue,
                    isPublished: data.isPublished ?? true,
                },
            });
            return ContentItemMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async createMany(items: CreateContentItemInput[]): Promise<ContentItemEntity[]> {
        try {
            const created = await this.prisma.$transaction(
                items.map((item) =>
                    this.prisma.contentItem.create({
                        data: {
                            contentTypeId: item.contentTypeId,
                            data: item.data as Prisma.InputJsonValue,
                            isPublished: item.isPublished ?? true,
                        },
                    })
                )
            );
            return created.map(ContentItemMapper.toDomain);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<ContentItemEntity | null> {
        try {
            const found = await this.prisma.contentItem.findUnique({
                where: { id },
            });
            return found ? ContentItemMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async list(params: {
        page?: number;
        limit?: number;
        filters?: ListContentItemsFilters;
    }): Promise<{ data: ContentItemEntity[]; total: number }> {
        try {
            const page = Math.max(1, params.page || 1);
            const limit = Math.max(1, params.limit || 10);
            const skip = (page - 1) * limit;

            const where: Prisma.ContentItemWhereInput = {};

            if (params.filters) {
                if (params.filters.contentTypeId) {
                    where.contentTypeId = params.filters.contentTypeId;
                }
                if (params.filters.isPublished !== undefined) {
                    where.isPublished = params.filters.isPublished;
                }
                if (params.filters.fieldFilters && Object.keys(params.filters.fieldFilters).length > 0) {
                    const andClauses: Prisma.ContentItemWhereInput[] = [];
                    for (const [key, val] of Object.entries(params.filters.fieldFilters)) {
                        const jsonPath = key.startsWith('$') ? key : `$.${key}`;
                        andClauses.push({
                            data: {
                                path: jsonPath,
                                equals: val,
                            },
                        });
                    }
                    where.AND = andClauses;
                }
            }

            const [total, items] = await Promise.all([
                this.prisma.contentItem.count({ where }),
                this.prisma.contentItem.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
            ]);

            return {
                data: items.map(ContentItemMapper.toDomain),
                total,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateContentItemInput): Promise<ContentItemEntity> {
        try {
            const updateData: Prisma.ContentItemUpdateInput = {};

            if (data.data !== undefined) {
                updateData.data = data.data as Prisma.InputJsonValue;
            }
            if (data.isPublished !== undefined) {
                updateData.isPublished = data.isPublished;
            }

            const updated = await this.prisma.contentItem.update({
                where: { id },
                data: updateData,
            });

            return ContentItemMapper.toDomain(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.contentItem.delete({
                where: { id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async countByContentType(contentTypeId: string): Promise<number> {
        try {
            return await this.prisma.contentItem.count({
                where: { contentTypeId },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
