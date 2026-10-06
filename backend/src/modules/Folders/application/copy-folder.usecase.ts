import type { FoldersRepository } from "../domain/folders.repository.js";
import type { BrandsRepository } from "../../Brands/domain/brands.repository.js";
import type { AssetsRepository } from "../../Assets/domain/assets.repository.js";
import type { StorageProvider } from "@shared/domain/storage.provider.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import type { GetFolder } from "../domain/folder.entity.js";
import { StoragePathHelper } from "../../Assets/application/services/storage-path.helper.js";
import { CopyNamingHelper } from "../../Assets/application/services/copy-naming.helper.js";
import AppError from "@shared/errors/AppError.js";

export interface CopyFolderInput {
    targetBrandId: string;
    targetParentId?: string | null;
}

export class CopyFolderUseCase {
    constructor(
        private readonly foldersRepository: FoldersRepository,
        private readonly brandsRepository: BrandsRepository,
        private readonly assetsRepository: AssetsRepository,
        private readonly storageProvider: StorageProvider,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(folderId: string, input: CopyFolderInput, context?: AuditContext): Promise<GetFolder> {
        // 1. Validate Source Folder
        const sourceFolder = await this.foldersRepository.findById(folderId);
        if (!sourceFolder) {
            throw new AppError("Source folder not found", "FOLDER_NOT_FOUND", 404);
        }

        // 2. Validate Target Brand
        const targetBrand = await this.brandsRepository.findById(input.targetBrandId);
        if (!targetBrand) {
            throw new AppError("Target brand does not exist", "BRAND_NOT_FOUND", 404);
        }

        // 3. Validate Target Parent
        const targetParentId = input.targetParentId ? input.targetParentId : null;
        if (targetParentId) {
            const targetParent = await this.foldersRepository.findById(targetParentId);
            if (!targetParent) {
                throw new AppError("Target parent folder not found", "PARENT_FOLDER_NOT_FOUND", 404);
            }
            if (targetParent.brandId !== input.targetBrandId) {
                throw new AppError("Target parent belongs to a different brand", "PARENT_FOLDER_DIFFERENT_BRAND", 400);
            }

            // 4. Validate Cycle (Cannot copy into itself or any descendant)
            if (targetParentId === folderId) {
                throw new AppError("Cannot copy a folder inside itself", "FOLDER_CYCLE_DETECTED", 400);
            }

            if (sourceFolder.brandId === input.targetBrandId) {
                const wouldCreateCycle = await this.foldersRepository.isDescendant(folderId, targetParentId);
                if (wouldCreateCycle) {
                    throw new AppError("Cannot copy a folder into one of its subfolders", "FOLDER_CYCLE_DETECTED", 400);
                }
            }
        }

        // Track created resources for compensation
        const createdFolderIds: string[] = [];
        const createdR2Keys: string[] = [];

        try {
            // 5. Recursive Copy Function
            const copyBranch = async (
                currentSourceId: string,
                currentParentId: string | null,
                isRoot: boolean
            ): Promise<GetFolder> => {
                const currentSource = await this.foldersRepository.findById(currentSourceId);
                if (!currentSource) {
                    throw new AppError(`Folder ${currentSourceId} not found during copy`, "FOLDER_NOT_FOUND", 404);
                }

                // Resolve name (root uses "- copy" if collision, subfolders keep original unless collision in destination)
                let resolvedFolderName: string;
                if (isRoot) {
                    resolvedFolderName = await CopyNamingHelper.resolveUniqueFolderName(
                        currentSource.name,
                        input.targetBrandId,
                        currentParentId,
                        this.foldersRepository
                    );
                } else {
                    resolvedFolderName = await CopyNamingHelper.resolveUniqueFolderName(
                        currentSource.name,
                        input.targetBrandId,
                        currentParentId,
                        this.foldersRepository
                    );
                }

                // Create folder in DB
                const createdFolder = await this.foldersRepository.create({
                    name: resolvedFolderName,
                    description: currentSource.description,
                    brandId: input.targetBrandId,
                    parentId: currentParentId,
                });
                createdFolderIds.push(createdFolder.id);

                // Copy all assets directly in this folder
                const directAssets = await this.assetsRepository.findByFolderIds([currentSourceId]);
                for (const asset of directAssets) {
                    const { name: resolvedName, fileName: resolvedFileName } = await CopyNamingHelper.resolveUniqueAssetName(
                        asset.name,
                        asset.fileName,
                        input.targetBrandId,
                        createdFolder.id,
                        this.assetsRepository
                    );

                    const sourceKey = this.storageProvider.extractKeyFromUrl(asset.url);
                    if (sourceKey) {
                        const candidateFileBase = StoragePathHelper.sanitizeFileName(resolvedFileName);
                        const destinationKey = await StoragePathHelper.resolveAndBuildKey(
                            input.targetBrandId,
                            createdFolder.id,
                            candidateFileBase,
                            this.foldersRepository
                        );

                        const copyResult = await this.storageProvider.copy(sourceKey, destinationKey);
                        createdR2Keys.push(destinationKey);

                        await this.assetsRepository.create({
                            name: resolvedName,
                            description: asset.description,
                            url: copyResult.url,
                            sku: asset.sku,
                            type: asset.type,
                            fileName: resolvedFileName,
                            mimeType: asset.mimeType,
                            sizeBytes: BigInt(asset.sizeBytes),
                            extension: asset.extension,
                            metadata: asset.metadata,
                            brandId: input.targetBrandId,
                            folderId: createdFolder.id,
                        });
                    }
                }

                // Recursively copy all child folders
                const directChildren = await this.foldersRepository.findAllChildren(currentSourceId);
                for (const child of directChildren) {
                    await copyBranch(child.id, createdFolder.id, false);
                }

                return createdFolder;
            };

            const rootCopiedFolder = await copyBranch(folderId, targetParentId, true);

            // 6. Record Audit Log
            await this.auditLogService.record({
                userId: context?.userId,
                action: "CREATE",
                resource: "folder",
                resourceId: rootCopiedFolder.id,
                context,
                details: {
                    copiedFrom: {
                        id: sourceFolder.id,
                        name: sourceFolder.name,
                        brandId: sourceFolder.brandId,
                        parentId: sourceFolder.parentId,
                    },
                    name: rootCopiedFolder.name,
                    brandId: rootCopiedFolder.brandId,
                    parentId: rootCopiedFolder.parentId,
                    totalFoldersCreated: createdFolderIds.length,
                    totalAssetsCreated: createdR2Keys.length,
                },
            });

            return rootCopiedFolder;
        } catch (error) {
            console.error("Error during folder copy. Executing compensation rollback:", error);

            // Compensation: Delete created R2 objects
            if (createdR2Keys.length > 0) {
                await this.storageProvider.deleteMany(createdR2Keys).catch((r2Err) => {
                    console.error("Failed to compensate R2 objects deletion:", r2Err);
                });
            }

            // Compensation: Delete root created folder (which cascades to its children)
            if (createdFolderIds.length > 0 && createdFolderIds[0]) {
                await this.foldersRepository.delete(createdFolderIds[0]).catch((dbErr) => {
                    console.error("Failed to compensate DB folder deletion:", dbErr);
                });
            }


            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Error copying directory structure", "INTERNAL_SERVER_ERROR", 500);
        }
    }
}
