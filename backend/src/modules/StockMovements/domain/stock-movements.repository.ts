import type { StockMovement, StockMovementFilters } from "./stock-movement.entity.js";

export interface StockMovementsRepository {
    createWithProductStockUpdate(
        data: {
            productId: string;
            type: StockMovement["type"];
            quantity: number;
            previousStock: number;
            resultingStock: number;
            reason: string;
            notes: string | null;
            userId: string;
        }
    ): Promise<StockMovement>;
    findAllPaginated(filters: StockMovementFilters): Promise<{ data: StockMovement[]; total: number }>;
    findByProductId(productId: string, limit?: number): Promise<StockMovement[]>;
}
