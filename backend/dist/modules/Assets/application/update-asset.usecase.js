import path from "path";
import { StoragePathHelper } from "./services/storage-path.helper.js";
import { AssetType } from "@prisma/client";
import AppError from "../../../shared/errors/AppError.js";
export class UpdateAssetUseCase {
    assetsRepository;
    brandsRepository;
    foldersRepository;
    storageProvider;
    auditLogService;
    constructor(assetsRepository, brandsRepository, foldersRepository, storageProvider, auditLogService) {
        this.assetsRepository = assetsRepository;
        this.brandsRepository = brandsRepository;
        this.foldersRepository = foldersRepository;
        this.storageProvider = storageProvider;
        this.auditLogService = auditLogService;
    }
    determineAssetType(mimeType) {
        const mime = mimeType.toLowerCase();
        if (mime.startsWith("image/"))
            return AssetType.IMAGE;
        if (mime.startsWith("video/"))
            return AssetType.VIDEO;
        if (mime.startsWith("audio/"))
            return AssetType.AUDIO;
        if (mime === "application/pdf" ||
            mime.includes("document") ||
            mime.includes("sheet") ||
            mime.includes("msword") ||
            mime.includes("presentation") ||
            mime.startsWith("text/")) {
            return AssetType.DOCUMENT;
        }
        if (mime.includes("zip") ||
            mime.includes("tar") ||
            mime.includes("rar") ||
            mime.includes("compressed") ||
            mime.includes("archive")) {
            return AssetType.ARCHIVE;
        }
        return AssetType.OTHER;
    }
    async execute(id, data, context) {
        // 1. Fetch current asset
        const currentAsset = await this.assetsRepository.findById(id);
        if (!currentAsset) {
            throw new AppError("Asset not found", "ASSET_NOT_FOUND", 404);
        }
        const effectiveBrandId = data.brandId || currentAsset.brandId;
        // 2. Validate Brand if changed
        if (data.brandId && data.brandId !== currentAsset.brandId) {
            const brand = await this.brandsRepository.findById(data.brandId);
            if (!brand) {
                throw new AppError("Brand not found", "BRAND_NOT_FOUND", 404);
            }
        }
        // 3. Validate Folder if changed
        if (data.folderId !== undefined) {
            if (data.folderId !== null) {
                const folder = await this.foldersRepository.findById(data.folderId);
                if (!folder) {
                    throw new AppError("Folder not found", "FOLDER_NOT_FOUND", 404);
                }
                if (folder.brandId !== effectiveBrandId) {
                    throw new AppError("Folder belongs to a different brand", "FOLDER_DIFFERENT_BRAND", 400);
                }
            }
        }
        const repoUpdateData = {};
        if (data.name !== undefined)
            repoUpdateData.name = data.name.trim();
        if (data.description !== undefined)
            repoUpdateData.description = data.description ? data.description.trim() : null;
        if (data.sku !== undefined)
            repoUpdateData.sku = data.sku ? data.sku.trim() : null;
        if (data.brandId !== undefined)
            repoUpdateData.brandId = data.brandId;
        if (data.folderId !== undefined)
            repoUpdateData.folderId = data.folderId;
        let fileDetails = null;
        // 4. Handle Physical File Replacement or Relocation
        const oldKey = this.storageProvider.extractKeyFromUrl(currentAsset.url);
        const targetFolderId = data.folderId !== undefined ? data.folderId : currentAsset.folderId;
        const targetBrandId = effectiveBrandId;
        const targetFileName = currentAsset.fileName;
        if (data.file && data.file.buffer && data.file.buffer.length > 0) {
            const originalName = data.file.originalname;
            const mimeType = data.file.mimetype;
            const sizeBytes = BigInt(data.file.size);
            const parsedExt = path.extname(originalName).replace(/^\./, "").toLowerCase();
            const extension = parsedExt || null;
            const type = this.determineAssetType(mimeType);
            fileDetails = {
                oldFileName: currentAsset.fileName,
                newFileName: originalName,
                oldMimeType: currentAsset.mimeType,
                newMimeType: mimeType,
                oldSizeBytes: Number(currentAsset.sizeBytes),
                newSizeBytes: Number(data.file.size),
            };
            const newKey = await StoragePathHelper.resolveAndBuildKey(targetBrandId, targetFolderId, StoragePathHelper.sanitizeFileName(originalName), this.foldersRepository);
            const uploadResult = await this.storageProvider.upload({
                key: newKey,
                buffer: data.file.buffer,
                mimeType,
            });
            if (oldKey && oldKey !== newKey) {
                await this.storageProvider.delete(oldKey).catch((e) => {
                    console.error("Failed to delete old file key after replacement:", e);
                });
            }
            repoUpdateData.url = uploadResult.url;
            repoUpdateData.fileName = originalName;
            repoUpdateData.mimeType = mimeType;
            repoUpdateData.sizeBytes = sizeBytes;
            repoUpdateData.extension = extension;
            repoUpdateData.type = type;
        }
        else if ((data.folderId !== undefined && data.folderId !== currentAsset.folderId) ||
            (data.brandId !== undefined && data.brandId !== currentAsset.brandId)) {
            // Relocation: Move physical file to new hierarchy in R2
            const currentFileNameInKey = oldKey.split("/").pop() || targetFileName;
            const newKey = await StoragePathHelper.resolveAndBuildKey(targetBrandId, targetFolderId, currentFileNameInKey, this.foldersRepository);
            if (oldKey && oldKey !== newKey) {
                const moveResult = await this.storageProvider.move(oldKey, newKey);
                repoUpdateData.url = moveResult.url;
            }
        }
        // 5. Update Database Record
        const updatedAsset = await this.assetsRepository.update(id, repoUpdateData);
        // 6. Audit Log
        await this.auditLogService.record({
            userId: context?.userId,
            action: "UPDATE",
            resource: "asset",
            resourceId: updatedAsset.id,
            context,
            before: {
                name: currentAsset.name,
                description: currentAsset.description,
                sku: currentAsset.sku,
                brandId: currentAsset.brandId,
                folderId: currentAsset.folderId,
                fileName: currentAsset.fileName,
                mimeType: currentAsset.mimeType,
                sizeBytes: Number(currentAsset.sizeBytes),
                type: currentAsset.type
            },
            after: {
                name: updatedAsset.name,
                description: updatedAsset.description,
                sku: updatedAsset.sku,
                brandId: updatedAsset.brandId,
                folderId: updatedAsset.folderId,
                fileName: updatedAsset.fileName,
                mimeType: updatedAsset.mimeType,
                sizeBytes: Number(updatedAsset.sizeBytes),
                type: updatedAsset.type
            },
            details: {
                fileReplaced: Boolean(data.file),
                ...(fileDetails ? { file: fileDetails } : {})
            }
        });
        return updatedAsset;
    }
}
//# sourceMappingURL=update-asset.usecase.js.map