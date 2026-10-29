import type { StockMovementsRepository } from "../domain/stock-movements.repository.js";
import type { StockMovement, RegisterMovementDTO } from "../domain/stock-movement.entity.js";
import type { ProductsRepository } from "../../Products/domain/products.repository.js";
import AppError from "@shared/errors/AppError.js";

export class RegisterMovementUseCase {
    constructor(
        private readonly stockMovementsRepository: StockMovementsRepository,
        private readonly productsRepository: ProductsRepository
    ) {}

    async execute(dto: RegisterMovementDTO): Promise<StockMovement> {
        const product = await this.productsRepository.findById(dto.productId);
        if (!product || !product.isActive) {
            throw new AppError("Product not found or inactive", "PRODUCT_NOT_FOUND", 404);
        }

        const previousStock = product.currentStock;
        let resultingStock = previousStock;

        switch (dto.type) {
            case "ENTRY": {
                if (dto.quantity <= 0) {
                    throw new AppError("Entry quantity must be greater than zero", "INVALID_QUANTITY", 400);
                }
                resultingStock = previousStock + dto.quantity;
                break;
            }
            case "EXIT": {
                if (dto.quantity <= 0) {
                    throw new AppError("Exit quantity must be greater than zero", "INVALID_QUANTITY", 400);
                }
                if (previousStock < dto.quantity) {
                    throw new AppError(
                        `Insufficient stock: current stock is ${previousStock}, cannot withdraw ${dto.quantity}`,
                        "INSUFFICIENT_STOCK",
                        400
                    );
                }
                resultingStock = previousStock - dto.quantity;
                break;
            }
            case "ADJUST": {
                if (dto.quantity < 0) {
                    throw new AppError("Adjusted resulting stock cannot be negative", "INVALID_QUANTITY", 400);
                }
                if (!dto.notes || !dto.notes.trim()) {
                    throw new AppError("Justification notes are mandatory for stock adjustments", "NOTES_REQUIRED", 400);
                }
                resultingStock = dto.quantity;
                break;
            }
            default:
                throw new AppError("Unsupported movement type", "INVALID_MOVEMENT_TYPE", 400);
        }

        return await this.stockMovementsRepository.createWithProductStockUpdate({
            productId: dto.productId,
            type: dto.type,
            quantity: dto.quantity,
            previousStock,
            resultingStock,
            reason: dto.reason.trim(),
            notes: dto.notes?.trim() || null,
            userId: dto.userId,
        });
    }
}
