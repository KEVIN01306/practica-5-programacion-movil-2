import { type PrismaClient } from "@prisma/client";
import type { AssetsRepository } from "../domain/assets.repository.js";
import type { AssetEntity, CreateAssetRepoInput, UpdateAssetRepoInput, ListAssetsFilters } from "../domain/asset.entity.js";
export declare class PrismaAssetsRepository implements AssetsRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateAssetRepoInput): Promise<AssetEntity>;
    findById(id: string): Promise<AssetEntity | null>;
    findByUrl(url: string): Promise<AssetEntity | null>;
    findAllPaginated(page?: number, limit?: number, filters?: ListAssetsFilters): Promise<{
        data: AssetEntity[];
        total: number;
    }>;
    update(id: string, data: UpdateAssetRepoInput): Promise<AssetEntity>;
    findByNameAndFolder(name: string, brandId: string, folderId: string | null): Promise<AssetEntity | null>;
    findByFileNameAndFolder(fileName: string, brandId: string, folderId: string | null): Promise<AssetEntity | null>;
    findByFolderIds(folderIds: string[]): Promise<AssetEntity[]>;
    delete(id: string): Promise<void>;
    deleteMany(ids: string[]): Promise<void>;
}
//# sourceMappingURL=prisma-assets.repository.d.ts.map