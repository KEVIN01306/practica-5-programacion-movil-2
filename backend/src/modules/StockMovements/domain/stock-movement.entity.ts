import type { MovementType } from "@prisma/client";

export interface StockMovement {
    id: string;
    productId: string;
    productName?: string;
    productCode?: string;
    type: MovementType;
    quantity: number;
    previousStock: number;
    resultingStock: number;
    reason: string;
    notes: string | null;
    userId: string;
    userName?: string;
    createdAt: Date;
}

export interface RegisterMovementDTO {
    productId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    notes?: string | null;
    userId: string;
}

export interface StockMovementFilters {
    page?: number;
    limit?: number;
    productId?: string;
    type?: MovementType;
    startDate?: Date;
    endDate?: Date;
}
