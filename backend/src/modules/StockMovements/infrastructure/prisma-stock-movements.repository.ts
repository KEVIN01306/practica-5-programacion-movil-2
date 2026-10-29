import type { PrismaClient } from "@prisma/client";
import type { StockMovementsRepository } from "../domain/stock-movements.repository.js";
import type { StockMovement, StockMovementFilters } from "../domain/stock-movement.entity.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import { StockMovementsMapper } from "./mappers/stock-movements.mapper.js";

export class PrismaStockMovementsRepository implements StockMovementsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async createWithProductStockUpdate(data: {
        productId: string;
        type: StockMovement["type"];
        quantity: number;
        previousStock: number;
        resultingStock: number;
        reason: string;
        notes: string | null;
        userId: string;
    }): Promise<StockMovement> {
        try {
            return await this.prisma.$transaction(async (tx: any) => {
                // 1. Update product's current stock
                await tx.product.update({
                    where: { id: data.productId },
                    data: { currentStock: data.resultingStock }
                });

                // 2. Insert stock movement record
                const movement = await tx.stockMovement.create({
                    data: {
                        productId: data.productId,
                        type: data.type,
                        quantity: data.quantity,
                        previousStock: data.previousStock,
                        resultingStock: data.resultingStock,
                        reason: data.reason,
                        notes: data.notes,
                        userId: data.userId,
                    },
                    include: {
                        product: true,
                        user: true,
                    }
                });

                return StockMovementsMapper.toDomain(movement);
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAllPaginated(filters: StockMovementFilters): Promise<{ data: StockMovement[]; total: number }> {
        try {
            const page = filters.page ? Math.max(1, filters.page) : 1;
            const limit = filters.limit ? Math.max(1, filters.limit) : 10;
            const skip = (page - 1) * limit;

            const where: any = {};

            if (filters.productId) {
                where.productId = filters.productId;
            }

            if (filters.type) {
                where.type = filters.type;
            }

            if (filters.startDate || filters.endDate) {
                where.createdAt = {};
                if (filters.startDate) where.createdAt.gte = filters.startDate;
                if (filters.endDate) where.createdAt.lte = filters.endDate;
            }

            const [list, total] = await Promise.all([
                this.prisma.stockMovement.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        product: true,
                        user: true,
                    },
                    orderBy: { createdAt: "desc" }
                }),
                this.prisma.stockMovement.count({ where })
            ]);

            return {
                data: list.map(StockMovementsMapper.toDomain),
                total
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByProductId(productId: string, limit: number = 20): Promise<StockMovement[]> {
        try {
            const list = await this.prisma.stockMovement.findMany({
                where: { productId },
                take: limit,
                include: {
                    product: true,
                    user: true,
                },
                orderBy: { createdAt: "desc" }
            });
            return list.map(StockMovementsMapper.toDomain);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
