import type { PrismaClient } from "@prisma/client";
import type { ProductsRepository } from "../domain/products.repository.js";
import type { Product, CreateProduct, UpdateProduct, ProductFilters } from "../domain/product.entity.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import { ProductsMapper } from "./mappers/products.mapper.js";

export class PrismaProductsRepository implements ProductsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateProduct): Promise<Product> {
        try {
            const raw = await this.prisma.product.create({
                data: {
                    code: data.code,
                    name: data.name,
                    description: data.description ?? null,
                    costPrice: data.costPrice,
                    salePrice: data.salePrice,
                    currentStock: data.currentStock ?? 0,
                    minStock: data.minStock ?? 0,
                    imageUrl: data.imageUrl ?? null,
                    categoryId: data.categoryId,
                    isActive: true,
                },
                include: {
                    category: true,
                }
            });
            return ProductsMapper.toDomain(raw);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateProduct): Promise<Product> {
        try {
            const updatePayload: any = {};
            if (data.code !== undefined) updatePayload.code = data.code;
            if (data.name !== undefined) updatePayload.name = data.name;
            if (data.description !== undefined) updatePayload.description = data.description;
            if (data.costPrice !== undefined) updatePayload.costPrice = data.costPrice;
            if (data.salePrice !== undefined) updatePayload.salePrice = data.salePrice;
            if (data.minStock !== undefined) updatePayload.minStock = data.minStock;
            if (data.imageUrl !== undefined) updatePayload.imageUrl = data.imageUrl;
            if (data.categoryId !== undefined) updatePayload.categoryId = data.categoryId;

            const raw = await this.prisma.product.update({
                where: { id },
                data: updatePayload,
                include: {
                    category: true,
                }
            });
            return ProductsMapper.toDomain(raw);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async softDelete(id: string): Promise<Product> {
        try {
            const raw = await this.prisma.product.update({
                where: { id },
                data: { isActive: false },
                include: {
                    category: true,
                }
            });
            return ProductsMapper.toDomain(raw);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<Product | null> {
        try {
            const raw = await this.prisma.product.findUnique({
                where: { id },
                include: { category: true }
            });
            return raw ? ProductsMapper.toDomain(raw) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByCode(code: string): Promise<Product | null> {
        try {
            const raw = await this.prisma.product.findUnique({
                where: { code },
                include: { category: true }
            });
            return raw ? ProductsMapper.toDomain(raw) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAllPaginated(filters: ProductFilters): Promise<{ data: Product[]; total: number }> {
        try {
            const page = filters.page ? Math.max(1, filters.page) : 1;
            const limit = filters.limit ? Math.max(1, filters.limit) : 10;
            const skip = (page - 1) * limit;

            const where: any = { isActive: true };

            if (filters.categoryId) {
                where.categoryId = filters.categoryId;
            }

            if (filters.search) {
                const search = filters.search.trim();
                where.OR = [
                    { code: { contains: search, mode: "insensitive" } },
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ];
            }

            if (filters.lowStock) {
                const lowStockProductIds = await this.prisma.$queryRaw<Array<{ id: string }>>`SELECT id FROM products WHERE current_stock <= min_stock AND is_active = true;`;
                where.id = { in: lowStockProductIds.map((p: { id: string }) => p.id) };
            }

            const [list, total] = await Promise.all([
                this.prisma.product.findMany({
                    where,
                    skip,
                    take: limit,
                    include: { category: true },
                    orderBy: { name: "asc" }
                }),
                this.prisma.product.count({ where })
            ]);

            return {
                data: list.map(ProductsMapper.toDomain),
                total
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
