import type { StockMovement } from "../../domain/stock-movement.entity.js";

export class StockMovementsMapper {
    static toDomain(raw: any): StockMovement {
        const userName = raw.user ? `${raw.user.firstName} ${raw.user.lastName}`.trim() : undefined;
        return {
            id: raw.id,
            productId: raw.productId,
            productName: raw.product?.name,
            productCode: raw.product?.code,
            type: raw.type,
            quantity: raw.quantity,
            previousStock: raw.previousStock,
            resultingStock: raw.resultingStock,
            reason: raw.reason,
            notes: raw.notes ?? null,
            userId: raw.userId,
            userName,
            createdAt: raw.createdAt,
        };
    }
}
