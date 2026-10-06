import type { PrismaClient } from "@prisma/client";
import type { FoldersRepository, FolderFilter } from "../domain/folders.repository.js";
import type { CreateFolder, UpdateFolder, GetFolder } from "../domain/folder.entity.js";
export declare class PrismaFoldersRepository implements FoldersRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateFolder): Promise<GetFolder>;
    update(id: string, data: UpdateFolder): Promise<GetFolder>;
    findById(id: string): Promise<GetFolder | null>;
    findByNameAndParent(name: string, brandId: string, parentId: string | null): Promise<GetFolder | null>;
    findAllPaginated(page?: number, limit?: number, filters?: FolderFilter): Promise<{
        data: GetFolder[];
        total: number;
    }>;
    findAllByBrandAndParent(brandId: string, parentId: string | null): Promise<GetFolder[]>;
    getBreadcrumbs(folderId: string): Promise<Array<{
        id: string;
        name: string;
        parentId: string | null;
    }>>;
    isDescendant(folderId: string, potentialChildId: string): Promise<boolean>;
    findAllChildren(parentId: string): Promise<GetFolder[]>;
    findSubfolderIdsRecursive(folderId: string): Promise<string[]>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=prisma-folders.repository.d.ts.map