import type { PrismaClient, Prisma } from "@prisma/client";
import type { WebsitesRepository } from "../domain/websites.repository.js";
import type {
    WebsiteEntity,
    CreateWebsiteInput,
    UpdateWebsiteInput,
    ListWebsitesFilters,
} from "../domain/website.entity.js";
import { WebsiteMapper } from "./website.mapper.js";
import { PrismaErrorMapper } from "../../../shared/db/database/prisma/PrismaErrorMapper.js";

export class PrismaWebsitesRepository implements WebsitesRepository {
    constructor(private readonly prisma: PrismaClient) {}

    private readonly defaultInclude = {
        owner: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        },
    };

    async create(data: CreateWebsiteInput): Promise<WebsiteEntity> {
        try {
            const created = await this.prisma.website.create({
                data: {
                    name: data.name,
                    domain: data.domain.toLowerCase().trim(),
                    apiKey: data.apiKey,
                    hostingProvider: data.hostingProvider ?? null,
                    hostingNotes: data.hostingNotes ?? null,
                    isActive: data.isActive ?? true,
                    ownerId: data.ownerId ?? null,
                },
                include: this.defaultInclude,
            });
            return WebsiteMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<WebsiteEntity | null> {
        try {
            const found = await this.prisma.website.findUnique({
                where: { id },
                include: this.defaultInclude,
            });
            return found ? WebsiteMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByDomain(domain: string): Promise<WebsiteEntity | null> {
        try {
            const found = await this.prisma.website.findUnique({
                where: { domain: domain.toLowerCase().trim() },
                include: this.defaultInclude,
            });
            return found ? WebsiteMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByApiKey(apiKey: string): Promise<WebsiteEntity | null> {
        try {
            const found = await this.prisma.website.findUnique({
                where: { apiKey },
                include: this.defaultInclude,
            });
            return found ? WebsiteMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async list(params: {
        page?: number;
        limit?: number;
        filters?: ListWebsitesFilters;
    }): Promise<{ data: WebsiteEntity[]; total: number }> {
        try {
            const page = Math.max(1, params.page || 1);
            const limit = Math.max(1, params.limit || 10);
            const skip = (page - 1) * limit;

            const where: Prisma.WebsiteWhereInput = {};

            if (params.filters) {
                if (params.filters.isActive !== undefined) {
                    where.isActive = params.filters.isActive;
                }

                if (params.filters.ownerId) {
                    where.ownerId = params.filters.ownerId;
                }

                if (params.filters.search && params.filters.search.trim() !== "") {
                    const search = params.filters.search.trim();
                    where.OR = [
                        { name: { contains: search } },
                        { domain: { contains: search } },
                        { hostingProvider: { contains: search } },
                    ];
                }
            }

            const [total, items] = await Promise.all([
                this.prisma.website.count({ where }),
                this.prisma.website.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: this.defaultInclude,
                }),
            ]);

            return {
                data: items.map(WebsiteMapper.toDomain),
                total,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateWebsiteInput): Promise<WebsiteEntity> {
        try {
            const updateData: Prisma.WebsiteUpdateInput = {};

            if (data.name !== undefined) updateData.name = data.name;
            if (data.domain !== undefined) updateData.domain = data.domain.toLowerCase().trim();
            if (data.apiKey !== undefined) updateData.apiKey = data.apiKey;
            if (data.hostingProvider !== undefined) updateData.hostingProvider = data.hostingProvider;
            if (data.hostingNotes !== undefined) updateData.hostingNotes = data.hostingNotes;
            if (data.isActive !== undefined) updateData.isActive = data.isActive;
            if (data.ownerId !== undefined) {
                updateData.owner = data.ownerId ? { connect: { id: data.ownerId } } : { disconnect: true };
            }

            const updated = await this.prisma.website.update({
                where: { id },
                data: updateData,
                include: this.defaultInclude,
            });

            return WebsiteMapper.toDomain(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.website.delete({
                where: { id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async regenerateApiKey(id: string, newApiKey: string): Promise<WebsiteEntity> {
        try {
            const updated = await this.prisma.website.update({
                where: { id },
                data: { apiKey: newApiKey },
                include: this.defaultInclude,
            });
            return WebsiteMapper.toDomain(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
