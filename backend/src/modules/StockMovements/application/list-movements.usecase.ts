import type { StockMovementsRepository } from "../domain/stock-movements.repository.js";
import type { StockMovement, StockMovementFilters } from "../domain/stock-movement.entity.js";

export class ListMovementsUseCase {
    constructor(private readonly stockMovementsRepository: StockMovementsRepository) {}

    async execute(filters: StockMovementFilters): Promise<{ data: StockMovement[]; total: number }> {
        return await this.stockMovementsRepository.findAllPaginated(filters);
    }
}
