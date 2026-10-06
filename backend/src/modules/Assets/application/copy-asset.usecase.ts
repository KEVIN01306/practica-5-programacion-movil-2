import type { AssetsRepository } from "../domain/assets.repository.js";
import type { BrandsRepository } from "../../Brands/domain/brands.repository.js";
import type { FoldersRepository } from "../../Folders/domain/folders.repository.js";
import type { StorageProvider } from "@shared/domain/storage.provider.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import type { AssetEntity } from "../domain/asset.entity.js";
import { StoragePathHelper } from "./services/storage-path.helper.js";
import { CopyNamingHelper } from "./services/copy-naming.helper.js";
import AppError from "@shared/errors/AppError.js";

export interface CopyAssetInput {
    targetBrandId: string;
    targetFolderId?: string | null;
}

export class CopyAssetUseCase {
    constructor(
        private readonly assetsRepository: AssetsRepository,
        private readonly brandsRepository: BrandsRepository,
        private readonly foldersRepository: FoldersRepository,
        private readonly storageProvider: StorageProvider,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(assetId: string, input: CopyAssetInput, context?: AuditContext): Promise<AssetEntity> {
        // 1. Fetch source asset
        const sourceAsset = await this.assetsRepository.findById(assetId);
        if (!sourceAsset) {
            throw new AppError("Asset not found", "ASSET_NOT_FOUND", 404);
        }

        // 2. Validate Target Brand
        const targetBrand = await this.brandsRepository.findById(input.targetBrandId);
        if (!targetBrand) {
            throw new AppError("Target brand does not exist", "BRAND_NOT_FOUND", 404);
        }

        // 3. Validate Target Folder (if specified)
        const targetFolderId = input.targetFolderId ? input.targetFolderId : null;
        if (targetFolderId) {
            const targetFolder = await this.foldersRepository.findById(targetFolderId);
            if (!targetFolder) {
                throw new AppError("Target folder does not exist", "FOLDER_NOT_FOUND", 404);
            }
            if (targetFolder.brandId !== input.targetBrandId) {
                throw new AppError("Target folder belongs to a different brand", "FOLDER_BRAND_MISMATCH", 400);
            }
        }

        // 4. Resolve Unique Names in Target Location
        const { name: resolvedName, fileName: resolvedFileName } = await CopyNamingHelper.resolveUniqueAssetName(
            sourceAsset.name,
            sourceAsset.fileName,
            input.targetBrandId,
            targetFolderId,
            this.assetsRepository
        );

        // 5. Build Source and Destination S3 Keys
        const sourceKey = this.storageProvider.extractKeyFromUrl(sourceAsset.url);
        if (!sourceKey) {
            throw new AppError("Source file location is invalid", "INVALID_SOURCE_KEY", 500);
        }

        const candidateFileBase = StoragePathHelper.sanitizeFileName(resolvedFileName);
        const destinationKey = await StoragePathHelper.resolveAndBuildKey(
            input.targetBrandId,
            targetFolderId,
            candidateFileBase,
            this.foldersRepository
        );

        // 6. Perform physical copy in Cloudflare R2
        const copyResult = await this.storageProvider.copy(sourceKey, destinationKey);

        // 7. Create new Asset record in Database with Compensation
        try {
            const newAsset = await this.assetsRepository.create({
                name: resolvedName,
                description: sourceAsset.description,
                url: copyResult.url,
                sku: sourceAsset.sku,
                type: sourceAsset.type,
                fileName: resolvedFileName,
                mimeType: sourceAsset.mimeType,
                sizeBytes: BigInt(sourceAsset.sizeBytes),
                extension: sourceAsset.extension,
                metadata: sourceAsset.metadata,
                brandId: input.targetBrandId,
                folderId: targetFolderId,
            });


            // 8. Record Audit Log
            await this.auditLogService.record({
                userId: context?.userId,
                action: "CREATE",
                resource: "asset",
                resourceId: newAsset.id,
                context,
                details: {
                    copiedFrom: {
                        id: sourceAsset.id,
                        name: sourceAsset.name,
                        brandId: sourceAsset.brandId,
                        folderId: sourceAsset.folderId,
                    },
                    name: newAsset.name,
                    fileName: newAsset.fileName,
                    url: newAsset.url,
                    brandId: newAsset.brandId,
                    folderId: newAsset.folderId,
                },
            });

            return newAsset;
        } catch (dbError) {
            // Compensation: Delete newly copied physical object from R2 to prevent orphans
            console.error("Database insert failed after R2 copy. Rolling back R2 object:", dbError);
            await this.storageProvider.delete(destinationKey).catch((r2Err) => {
                console.error("Failed to compensate R2 deletion during copy rollback:", r2Err);
            });
            throw dbError;
        }
    }
}
