import type { ContentItemsRepository } from "../domain/content-items.repository.js";
import type { ContentItemEntity } from "../domain/content-item.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class GetContentItemUseCase {
    constructor(private readonly contentItemsRepository: ContentItemsRepository) {}

    async execute(id: string): Promise<ContentItemEntity> {
        const item = await this.contentItemsRepository.findById(id);
        if (!item) {
            throw new AppError("Content Item not found", "CONTENT_ITEM_NOT_FOUND", 404);
        }
        return item;
    }
}
