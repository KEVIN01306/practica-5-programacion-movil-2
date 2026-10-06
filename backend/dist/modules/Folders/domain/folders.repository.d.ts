import type { CreateFolder, UpdateFolder, GetFolder } from "./folder.entity.js";
export interface FolderFilter {
    brandId?: string;
    parentId?: string | null;
    q?: string;
}
export interface FoldersRepository {
    create(data: CreateFolder): Promise<GetFolder>;
    update(id: string, data: UpdateFolder): Promise<GetFolder>;
    findById(id: string): Promise<GetFolder | null>;
    findByNameAndParent(name: string, brandId: string, parentId: string | null): Promise<GetFolder | null>;
    findAllPaginated(page: number, limit: number, filters?: FolderFilter): Promise<{
        data: GetFolder[];
        total: number;
    }>;
    findAllByBrandAndParent(brandId: string, parentId: string | null): Promise<GetFolder[]>;
    findAllChildren(parentId: string): Promise<GetFolder[]>;
    getBreadcrumbs(folderId: string): Promise<Array<{
        id: string;
        name: string;
        parentId: string | null;
    }>>;
    isDescendant(folderId: string, potentialChildId: string): Promise<boolean>;
    findSubfolderIdsRecursive(folderId: string): Promise<string[]>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=folders.repository.d.ts.map