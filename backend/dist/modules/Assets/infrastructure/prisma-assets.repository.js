import { Prisma } from "@prisma/client";
import { PrismaErrorMapper } from "../../../shared/db/database/prisma/PrismaErrorMapper.js";
import { AssetsMapper } from "./mappers/assets.mapper.js";
export class PrismaAssetsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        try {
            const asset = await this.prisma.asset.create({
                data: {
                    ...(data.id && { id: data.id }),
                    name: data.name,
                    description: data.description ?? null,
                    url: data.url,
                    sku: data.sku ?? null,
                    type: data.type,
                    fileName: data.fileName,
                    mimeType: data.mimeType,
                    sizeBytes: data.sizeBytes,
                    extension: data.extension ?? null,
                    metadata: data.metadata ?? Prisma.JsonNull,
                    brandId: data.brandId,
                    folderId: data.folderId ?? null,
                },
                include: {
                    brand: { select: { id: true, name: true } },
                    folder: { select: { id: true, name: true } },
                },
            });
            return AssetsMapper.toDomain(asset);
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async findById(id) {
        try {
            const asset = await this.prisma.asset.findUnique({
                where: { id },
                include: {
                    brand: { select: { id: true, name: true } },
                    folder: { select: { id: true, name: true } },
                },
            });
            return asset ? AssetsMapper.toDomain(asset) : null;
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async findByUrl(url) {
        try {
            const asset = await this.prisma.asset.findFirst({
                where: { url },
                include: {
                    brand: { select: { id: true, name: true } },
                    folder: { select: { id: true, name: true } },
                },
            });
            return asset ? AssetsMapper.toDomain(asset) : null;
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async findAllPaginated(page = 1, limit = 10, filters) {
        try {
            const skip = Math.max(0, (page - 1) * limit);
            const where = {};
            if (filters?.brandId) {
                where.brandId = filters.brandId;
            }
            if (filters?.folderId !== undefined) {
                where.folderId = filters.folderId;
            }
            if (filters?.type) {
                where.type = filters.type;
            }
            if (filters?.sku) {
                where.sku = { contains: filters.sku.trim() };
            }
            if (filters?.q) {
                const query = filters.q.trim();
                where.OR = [
                    { name: { contains: query } },
                    { sku: { contains: query } },
                    { fileName: { contains: query } },
                    { description: { contains: query } },
                ];
            }
            const [total, records] = await Promise.all([
                this.prisma.asset.count({ where }),
                this.prisma.asset.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: {
                        createdAt: "desc",
                    },
                    include: {
                        brand: { select: { id: true, name: true } },
                        folder: { select: { id: true, name: true } },
                    },
                }),
            ]);
            return {
                data: records.map(AssetsMapper.toDomain),
                total,
            };
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async update(id, data) {
        try {
            const updateData = {};
            if (data.name !== undefined)
                updateData.name = data.name;
            if (data.description !== undefined)
                updateData.description = data.description;
            if (data.sku !== undefined)
                updateData.sku = data.sku;
            if (data.url !== undefined)
                updateData.url = data.url;
            if (data.type !== undefined)
                updateData.type = data.type;
            if (data.fileName !== undefined)
                updateData.fileName = data.fileName;
            if (data.mimeType !== undefined)
                updateData.mimeType = data.mimeType;
            if (data.sizeBytes !== undefined)
                updateData.sizeBytes = data.sizeBytes;
            if (data.extension !== undefined)
                updateData.extension = data.extension;
            if (data.metadata !== undefined) {
                updateData.metadata = data.metadata === null ? Prisma.JsonNull : data.metadata;
            }
            if (data.brandId !== undefined) {
                updateData.brand = { connect: { id: data.brandId } };
            }
            if (data.folderId !== undefined) {
                updateData.folder = data.folderId ? { connect: { id: data.folderId } } : { disconnect: true };
            }
            const asset = await this.prisma.asset.update({
                where: { id },
                data: updateData,
                include: {
                    brand: { select: { id: true, name: true } },
                    folder: { select: { id: true, name: true } },
                },
            });
            return AssetsMapper.toDomain(asset);
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async findByNameAndFolder(name, brandId, folderId) {
        try {
            const asset = await this.prisma.asset.findFirst({
                where: {
                    name,
                    brandId,
                    folderId: folderId === null ? null : folderId,
                },
                include: {
                    brand: { select: { id: true, name: true } },
                    folder: { select: { id: true, name: true } },
                },
            });
            return asset ? AssetsMapper.toDomain(asset) : null;
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async findByFileNameAndFolder(fileName, brandId, folderId) {
        try {
            const asset = await this.prisma.asset.findFirst({
                where: {
                    fileName,
                    brandId,
                    folderId: folderId === null ? null : folderId,
                },
                include: {
                    brand: { select: { id: true, name: true } },
                    folder: { select: { id: true, name: true } },
                },
            });
            return asset ? AssetsMapper.toDomain(asset) : null;
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async findByFolderIds(folderIds) {
        try {
            if (folderIds.length === 0)
                return [];
            const records = await this.prisma.asset.findMany({
                where: {
                    folderId: { in: folderIds },
                },
                include: {
                    brand: { select: { id: true, name: true } },
                    folder: { select: { id: true, name: true } },
                },
            });
            return records.map(AssetsMapper.toDomain);
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async delete(id) {
        try {
            await this.prisma.asset.delete({
                where: { id },
            });
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
    async deleteMany(ids) {
        try {
            if (ids.length === 0)
                return;
            await this.prisma.asset.deleteMany({
                where: {
                    id: { in: ids },
                },
            });
        }
        catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
//# sourceMappingURL=prisma-assets.repository.js.map