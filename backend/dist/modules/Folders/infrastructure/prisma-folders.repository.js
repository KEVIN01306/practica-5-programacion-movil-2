import { PrismaErrorMapper } from "../../../shared/db/database/prisma/PrismaErrorMapper.js";
import { FoldersMapper } from "./mappers/folders.mapper.js";
export class PrismaFoldersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
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
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async update(id, data) {
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
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async findById(id) {
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
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async findByNameAndParent(name, brandId, parentId) {
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
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async findAllPaginated(page = 1, limit = 10, filters) {
        try {
            const offset = (page - 1) * limit;
            const whereClause = {};
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
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async findAllByBrandAndParent(brandId, parentId) {
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
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async getBreadcrumbs(folderId) {
        try {
            const breadcrumbs = [];
            let currentId = folderId;
            let depth = 0;
            while (currentId && depth < 50) {
                const folder = await this.prisma.folder.findUnique({
                    where: { id: currentId },
                    select: { id: true, name: true, parentId: true }
                });
                if (!folder)
                    break;
                breadcrumbs.unshift(folder);
                currentId = folder.parentId;
                depth++;
            }
            return breadcrumbs;
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async isDescendant(folderId, potentialChildId) {
        try {
            if (folderId === potentialChildId)
                return true;
            let currentId = potentialChildId;
            let depth = 0;
            while (currentId && depth < 50) {
                if (currentId === folderId)
                    return true;
                const folder = await this.prisma.folder.findUnique({
                    where: { id: currentId },
                    select: { parentId: true }
                });
                if (!folder || !folder.parentId)
                    break;
                currentId = folder.parentId;
                depth++;
            }
            return false;
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async findAllChildren(parentId) {
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
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async findSubfolderIdsRecursive(folderId) {
        try {
            const allIds = [folderId];
            const queue = [folderId];
            while (queue.length > 0) {
                const currentId = queue.shift();
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
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async delete(id) {
        try {
            await this.prisma.folder.delete({
                where: { id }
            });
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
//# sourceMappingURL=prisma-folders.repository.js.map