import type { FoldersRepository } from "../domain/folders.repository.js";
import type { AssetsRepository } from "../../Assets/domain/assets.repository.js";
import type { StorageProvider } from "@shared/domain/storage.provider.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "@shared/errors/AppError.js";

export class DeleteFolderUseCase {
    constructor(
        private readonly foldersRepository: FoldersRepository,
        private readonly assetsRepository: AssetsRepository,
        private readonly storageProvider: StorageProvider,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, context?: AuditContext): Promise<void> {
        try {
            const existing = await this.foldersRepository.findById(id);
            if (!existing) {
                throw new AppError("Folder not found", "FOLDER_NOT_FOUND", 404);
            }

            // 1. Find all descendant folder IDs recursively
            const subfolderIds = await this.foldersRepository.findSubfolderIdsRecursive(id);

            // 2. Find all assets contained within this folder and all its descendants
            const affectedAssets = await this.assetsRepository.findByFolderIds(subfolderIds);

            // 3. Extract all physical R2 keys
            const keysToDelete = affectedAssets
                .map((a) => this.storageProvider.extractKeyFromUrl(a.url))
                .filter(Boolean);

            // 4. Delete physical objects in Cloudflare R2
            if (keysToDelete.length > 0) {
                await this.storageProvider.deleteMany(keysToDelete).catch((err) => {
                    console.error("Error deleting physical files from R2 during folder deletion:", err);
                });
            }

            // 5. Delete folder in DB (Cascade deletes subfolders & assets)
            await this.foldersRepository.delete(id);

            // 6. Record Audit Log
            await this.auditLogService.record({
                userId: context?.userId,
                action: "DELETE",
                resource: "folder",
                resourceId: id,
                context,
                details: {
                    deletedFolder: {
                        id: existing.id,
                        name: existing.name,
                        brandId: existing.brandId,
                        parentId: existing.parentId,
                        description: existing.description,
                    },
                    totalSubfoldersDeleted: subfolderIds.length - 1,
                    totalAssetsDeleted: affectedAssets.length,
                },
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Error deleting folder", "INTERNAL_SERVER_ERROR", 500);
        }
    }
}


