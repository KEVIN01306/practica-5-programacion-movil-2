import path from "path";
import type { AssetsRepository } from "../domain/assets.repository.js";
import type { CreateAssetInput, AssetEntity } from "../domain/asset.entity.js";
import type { BrandsRepository } from "../../Brands/domain/brands.repository.js";
import type { FoldersRepository } from "../../Folders/domain/folders.repository.js";
import type { StorageProvider } from "@shared/domain/storage.provider.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import { StoragePathHelper } from "./services/storage-path.helper.js";
import { AssetType } from "@prisma/client";
import AppError from "@shared/errors/AppError.js";


export class CreateAssetUseCase {
    constructor(
        private readonly assetsRepository: AssetsRepository,
        private readonly brandsRepository: BrandsRepository,
        private readonly foldersRepository: FoldersRepository,
        private readonly storageProvider: StorageProvider,
        private readonly auditLogService: AuditLogService
    ) {}


    private determineAssetType(mimeType: string): AssetType {
        const mime = mimeType.toLowerCase();
        if (mime.startsWith("image/")) return AssetType.IMAGE;
        if (mime.startsWith("video/")) return AssetType.VIDEO;
        if (mime.startsWith("audio/")) return AssetType.AUDIO;
        if (
            mime === "application/pdf" ||
            mime.includes("document") ||
            mime.includes("sheet") ||
            mime.includes("msword") ||
            mime.includes("presentation") ||
            mime.startsWith("text/")
        ) {
            return AssetType.DOCUMENT;
        }
        if (
            mime.includes("zip") ||
            mime.includes("tar") ||
            mime.includes("rar") ||
            mime.includes("compressed") ||
            mime.includes("archive")
        ) {
            return AssetType.ARCHIVE;
        }
        return AssetType.OTHER;
    }

    private sanitizeName(name: string): string {
        return name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/[^a-zA-Z0-9_\-\.]/g, "_") // replace spaces and special chars with underscore
            .replace(/_+/g, "_"); // collapse consecutive underscores
    }

    async execute(data: CreateAssetInput, context?: AuditContext): Promise<AssetEntity> {
        // 1. Validate Brand
        const brand = await this.brandsRepository.findById(data.brandId);
        if (!brand) {
            throw new AppError("Brand not found", "BRAND_NOT_FOUND", 404);
        }

        // 2. Validate Folder if provided
        if (data.folderId) {
            const folder = await this.foldersRepository.findById(data.folderId);
            if (!folder) {
                throw new AppError("Folder not found", "FOLDER_NOT_FOUND", 404);
            }
            if (folder.brandId !== data.brandId) {
                throw new AppError("Folder does not belong to the specified brand", "FOLDER_BRAND_MISMATCH", 400);
            }
        }

        // 3. Validate File
        if (!data.file || !data.file.buffer || data.file.buffer.length === 0) {
            throw new AppError("A valid file is required", "FILE_REQUIRED", 400);
        }

        // 4. Extract Technical Metadata
        const originalName = data.file.originalname;
        const mimeType = data.file.mimetype;
        const sizeBytes = BigInt(data.file.size);
        const parsedExt = path.extname(originalName).replace(/^\./, "").toLowerCase();
        const extension = parsedExt || null;
        const type = this.determineAssetType(mimeType);

        // 5. Determine base file name for R2
        const rawBase = data.sku && data.sku.trim() ? data.sku.trim() : data.name.trim();

        const cleanBase = this.sanitizeName(rawBase);
        const extSuffix = extension ? `.${extension}` : "";

        let candidateFileName = `${cleanBase}${extSuffix}`;
        let r2Key = await StoragePathHelper.resolveAndBuildKey(
            data.brandId,
            data.folderId || null,
            candidateFileName,
            this.foldersRepository
        );
        let candidateUrl = this.storageProvider.getUrl(r2Key);

        // 6. Collision Avoidance
        const existingWithUrl = await this.assetsRepository.findByUrl(candidateUrl);
        if (existingWithUrl) {
            const uniqueId = Date.now().toString(36);
            candidateFileName = `${cleanBase}_${uniqueId}${extSuffix}`;
            r2Key = await StoragePathHelper.resolveAndBuildKey(
                data.brandId,
                data.folderId || null,
                candidateFileName,
                this.foldersRepository
            );
        }

        // 7. Upload to Cloudflare R2
        const uploadResult = await this.storageProvider.upload({
            key: r2Key,
            buffer: data.file.buffer,
            mimeType,
        });


        // 8. Create Asset in Database with Rollback / Compensation
        try {
            const asset = await this.assetsRepository.create({
                name: data.name.trim(),
                description: data.description?.trim() || null,
                url: uploadResult.url,
                sku: data.sku?.trim() || null,
                type,
                fileName: originalName,
                mimeType,
                sizeBytes,
                extension,
                metadata: null,
                brandId: data.brandId,
                folderId: data.folderId || null,
            });

            // 9. Audit Log
            await this.auditLogService.record({
                userId: context?.userId,
                action: "CREATE",
                resource: "asset",
                resourceId: asset.id,
                context,
                details: {
                    name: asset.name,
                    sku: asset.sku,
                    type: asset.type,
                    url: asset.url,
                    fileName: asset.fileName,
                    mimeType: asset.mimeType,
                    sizeBytes: Number(asset.sizeBytes),
                    brandId: asset.brandId,
                    folderId: asset.folderId,
                },
            });

            return asset;

        } catch (dbError) {
            // Rollback: delete the uploaded file from R2 to prevent orphan objects
            console.error("Database insert failed. Rolling back R2 upload:", dbError);
            await this.storageProvider.delete(uploadResult.key).catch((r2Err) => {
                console.error("Failed to compensate R2 deletion during rollback:", r2Err);
            });
            throw dbError;
        }
    }
}
