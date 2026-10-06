import { StoragePathHelper } from "../../Assets/application/services/storage-path.helper.js";
import AppError from "../../../shared/errors/AppError.js";
import { UniqueConstraintError } from "../../../shared/db/database/errors/UniqueConstraintError.js";
export class UpdateFolderUseCase {
    foldersRepository;
    assetsRepository;
    storageProvider;
    auditLogService;
    constructor(foldersRepository, assetsRepository, storageProvider, auditLogService) {
        this.foldersRepository = foldersRepository;
        this.assetsRepository = assetsRepository;
        this.storageProvider = storageProvider;
        this.auditLogService = auditLogService;
    }
    async execute(id, data, context) {
        try {
            const existing = await this.foldersRepository.findById(id);
            if (!existing) {
                throw new AppError("Folder not found", "FOLDER_NOT_FOUND", 404);
            }
            let newParentId = existing.parentId;
            if (data.parentId !== undefined) {
                newParentId = data.parentId ? data.parentId : null;
                if (newParentId === id) {
                    throw new AppError("A folder cannot be its own parent", "FOLDER_CYCLE_DETECTED", 400);
                }
                if (newParentId !== null) {
                    const targetParent = await this.foldersRepository.findById(newParentId);
                    if (!targetParent) {
                        throw new AppError("Parent folder not found", "PARENT_FOLDER_NOT_FOUND", 404);
                    }
                    if (targetParent.brandId !== existing.brandId) {
                        throw new AppError("Parent folder belongs to a different brand", "PARENT_FOLDER_DIFFERENT_BRAND", 400);
                    }
                    // Check cycle: cannot move folder into any of its own descendants
                    const wouldCreateCycle = await this.foldersRepository.isDescendant(id, newParentId);
                    if (wouldCreateCycle) {
                        throw new AppError("Cannot move a folder into one of its subfolders", "FOLDER_CYCLE_DETECTED", 400);
                    }
                }
            }
            const targetName = data.name !== undefined ? data.name.trim() : existing.name;
            const hasStructuralChange = targetName !== existing.name || newParentId !== existing.parentId;
            // If name or parentId changed, verify uniqueness
            if (hasStructuralChange) {
                const duplicate = await this.foldersRepository.findByNameAndParent(targetName, existing.brandId, newParentId);
                if (duplicate && duplicate.id !== id) {
                    throw new AppError("A folder with this name already exists in the destination", "FOLDER_NAME_TAKEN", 400);
                }
            }
            const updated = await this.foldersRepository.update(id, {
                name: data.name !== undefined ? targetName : undefined,
                description: data.description !== undefined ? (data.description ? data.description.trim() : null) : undefined,
                parentId: data.parentId !== undefined ? newParentId : undefined,
            });
            // If folder name or parent changed, migrate all physical asset storage paths
            if (hasStructuralChange) {
                try {
                    const subfolderIds = await this.foldersRepository.findSubfolderIdsRecursive(id);
                    const affectedAssets = await this.assetsRepository.findByFolderIds(subfolderIds);
                    for (const asset of affectedAssets) {
                        const oldKey = this.storageProvider.extractKeyFromUrl(asset.url);
                        if (!oldKey)
                            continue;
                        const fileName = oldKey.split("/").pop() || asset.fileName;
                        const newKey = await StoragePathHelper.resolveAndBuildKey(asset.brandId, asset.folderId, fileName, this.foldersRepository);
                        if (oldKey !== newKey) {
                            const moveResult = await this.storageProvider.move(oldKey, newKey);
                            await this.assetsRepository.update(asset.id, {
                                url: moveResult.url,
                            });
                        }
                    }
                }
                catch (migrationError) {
                    console.error("Error migrating physical asset paths on folder update:", migrationError);
                    // Continue returning updated folder, but log error
                }
            }
            await this.auditLogService.record({
                userId: context?.userId,
                action: "UPDATE",
                resource: "folder",
                resourceId: updated.id,
                context,
                before: {
                    name: existing.name,
                    description: existing.description,
                    parentId: existing.parentId,
                },
                after: {
                    name: updated.name,
                    description: updated.description,
                    parentId: updated.parentId,
                },
            });
            return updated;
        }
        catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError("A folder with this name already exists in the destination", "FOLDER_NAME_TAKEN", 400);
            }
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Error updating folder", "INTERNAL_SERVER_ERROR", 500);
        }
    }
}
//# sourceMappingURL=update-folder.usecase.js.map