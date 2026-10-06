import type { FoldersRepository } from "../../../Folders/domain/folders.repository.js";

export class StoragePathHelper {
    /**
     * Sanitizes a folder or file name to be safe for S3 / Cloudflare R2 keys
     * while preserving meaningful names and letters.
     */
    static sanitizeSegment(segment: string): string {
        return segment
            .trim()
            .replace(/[/\\]+/g, "_") // prevent directory traversal or slash splitting inside name
            .replace(/\s+/g, " ")   // normalize multiple spaces to single space
            .replace(/[^\w\s\-.áéíóúÁÉÍÓÚñÑ]/g, "_"); // keep alphanumeric, spaces, dashes, dots and standard latin chars
    }

    /**
     * Sanitizes a file name preserving extension
     */
    static sanitizeFileName(name: string): string {
        return name
            .trim()
            .replace(/[/\\]+/g, "_")
            .replace(/\s+/g, "_")
            .replace(/_+/g, "_");
    }

    /**
     * Builds the storage key hierarchy:
     * brandId/folder1/folder2/.../fileName
     * or brandId/fileName if no folders.
     */
    static buildKeyFromNames(brandId: string, folderNames: string[], fileName: string): string {
        const cleanBrand = brandId.trim();
        const cleanFolderSegments = folderNames
            .map((f) => f.trim())
            .filter((f) => f.length > 0);
        const cleanFile = fileName.trim();

        if (cleanFolderSegments.length === 0) {
            return `${cleanBrand}/${cleanFile}`;
        }

        return `${cleanBrand}/${cleanFolderSegments.join("/")}/${cleanFile}`;
    }

    /**
     * Resolves breadcrumbs from FoldersRepository and generates the full hierarchical storage key.
     */
    static async resolveAndBuildKey(
        brandId: string,
        folderId: string | null | undefined,
        fileName: string,
        foldersRepository: FoldersRepository
    ): Promise<string> {
        if (!folderId) {
            return this.buildKeyFromNames(brandId, [], fileName);
        }

        const breadcrumbs = await foldersRepository.getBreadcrumbs(folderId);
        const folderNames = breadcrumbs.map((b) => b.name);

        return this.buildKeyFromNames(brandId, folderNames, fileName);
    }
}
