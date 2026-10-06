import type { PrismaClient } from "@prisma/client";
import type { FoldersRepository, FolderFilter } from "../domain/folders.repository.js";
import type { CreateFolder, UpdateFolder, GetFolder } from "../domain/folder.entity.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import { FoldersMapper } from "./mappers/folders.mapper.js";

export class PrismaFoldersRepository implements FoldersRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async create(data: CreateFolder): Promise<GetFolder> {
        try {
            const folder = await this.prisma.folder.create({
                data: {
                    name: data.name,
                    description: data.description ?? null,
                    brandId: data.brandId,
                    parentId: data.parentId ?? null
                },
                include: {
                    brand: { select: { id: true, name: true } },
                    parent: { select: { id: true, name: true } },
                    _count: { select: { children: true, assets: true } }
                }
            });
            return FoldersMapper.toDomain(folder);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateFolder): Promise<GetFolder> {
        try {
            const folder = await this.prisma.folder.update({
                where: { id },
                data: {
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.description !== undefined && { description: data.description }),
                    ...(data.parentId !== undefined && { parentId: data.parentId })
                },
                include: {
                    brand: { select: { id: true, name: true } },
                    parent: { select: { id: true, name: true } },
                    _count: { select: { children: true, assets: true } }
                }
            });
            return FoldersMapper.toDomain(folder);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<GetFolder | null> {
        try {
            const folder = await this.prisma.folder.findUnique({
                where: { id },
                include: {
                    brand: { select: { id: true, name: true } },
                    parent: { select: { id: true, name: true } },
                    _count: { select: { children: true, assets: true } }
                }
            });
            return folder ? FoldersMapper.toDomain(folder) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByNameAndParent(name: string, brandId: string, parentId: string | null): Promise<GetFolder | null> {
        try {
            const folder = await this.prisma.folder.findFirst({
                where: {
                    name,
                    brandId,
                    parentId: parentId === null ? null : parentId
                },
                include: {
                    brand: { select: { id: true, name: true } },
                    parent: { select: { id: true, name: true } },
                    _count: { select: { children: true, assets: true } }
                }
            });
            return folder ? FoldersMapper.toDomain(folder) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAllPaginated(
        page: number = 1,
        limit: number = 10,
        filters?: FolderFilter
    ): Promise<{ data: GetFolder[]; total: number }> {
        try {
            const offset = (page - 1) * limit;
            const whereClause: any = {};

            if (filters?.brandId) {
                whereClause.brandId = filters.brandId;
            }

            if (filters?.parentId !== undefined) {
                whereClause.parentId = filters.parentId;
            }

            if (filters?.q) {
                const query = filters.q.trim();
                whereClause.OR = [
                    { name: { contains: query } },
                    { description: { contains: query } }
                ];
            }

            const [folders, total] = await Promise.all([
                this.prisma.folder.findMany({
                    where: whereClause,
                    skip: offset,
                    take: limit,
                    orderBy: { name: "asc" },
                    include: {
                        brand: { select: { id: true, name: true } },
                        parent: { select: { id: true, name: true } },
                        _count: { select: { children: true, assets: true } }
                    }
                }),
                this.prisma.folder.count({ where: whereClause })
            ]);

            return {
                data: folders.map(FoldersMapper.toDomain),
                total
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAllByBrandAndParent(brandId: string, parentId: string | null): Promise<GetFolder[]> {
        try {
            const folders = await this.prisma.folder.findMany({
                where: {
                    brandId,
                    parentId: parentId === null ? null : parentId
                },
                orderBy: { name: "asc" },
                include: {
                    brand: { select: { id: true, name: true } },
                    parent: { select: { id: true, name: true } },
                    _count: { select: { children: true, assets: true } }
                }
            });
            return folders.map(FoldersMapper.toDomain);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async getBreadcrumbs(folderId: string): Promise<Array<{ id: string; name: string; parentId: string | null }>> {
        try {
            const breadcrumbs: Array<{ id: string; name: string; parentId: string | null }> = [];
            let currentId: string | null = folderId;
            let depth = 0;

            while (currentId && depth < 50) {
                const folder: { id: string; name: string; parentId: string | null } | null = await this.prisma.folder.findUnique({
                    where: { id: currentId },
                    select: { id: true, name: true, parentId: true }
                });

                if (!folder) break;
                breadcrumbs.unshift(folder);
                currentId = folder.parentId;
                depth++;
            }

            return breadcrumbs;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async isDescendant(folderId: string, potentialChildId: string): Promise<boolean> {
        try {
            if (folderId === potentialChildId) return true;

            let currentId: string | null = potentialChildId;
            let depth = 0;

            while (currentId && depth < 50) {
                if (currentId === folderId) return true;
                const folder: { parentId: string | null } | null = await this.prisma.folder.findUnique({
                    where: { id: currentId },
                    select: { parentId: true }
                });
                if (!folder || !folder.parentId) break;
                currentId = folder.parentId;
                depth++;
            }

            return false;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAllChildren(parentId: string): Promise<GetFolder[]> {
        try {
            const folders = await this.prisma.folder.findMany({
                where: { parentId },
                orderBy: { name: "asc" },
                include: {
                    brand: { select: { id: true, name: true } },
                    parent: { select: { id: true, name: true } },
                    _count: { select: { children: true, assets: true } }
                }
            });
            return folders.map(FoldersMapper.toDomain);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findSubfolderIdsRecursive(folderId: string): Promise<string[]> {
        try {
            const allIds: string[] = [folderId];
            const queue: string[] = [folderId];

            while (queue.length > 0) {
                const currentId = queue.shift()!;
                const children = await this.prisma.folder.findMany({
                    where: { parentId: currentId },
                    select: { id: true }
                });

                for (const child of children) {
                    allIds.push(child.id);
                    queue.push(child.id);
                }
            }

            return allIds;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.folder.delete({
                where: { id }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}

