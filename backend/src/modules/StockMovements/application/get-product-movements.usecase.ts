import type { StockMovementsRepository } from "../domain/stock-movements.repository.js";
import type { StockMovement } from "../domain/stock-movement.entity.js";

export class GetProductMovementsUseCase {
    constructor(private readonly stockMovementsRepository: StockMovementsRepository) {}

    async execute(productId: string, limit?: number): Promise<StockMovement[]> {
        return await this.stockMovementsRepository.findByProductId(productId, limit);
    }
}
