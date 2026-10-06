import type { AssetsRepository } from "../../domain/assets.repository.js";
import type { FoldersRepository } from "../../../Folders/domain/folders.repository.js";
import path from "path";

export class CopyNamingHelper {
    /**
     * Resolves an available unique name and file name for an asset copy in the target location.
     */
    static async resolveUniqueAssetName(
        originalName: string,
        originalFileName: string,
        targetBrandId: string,
        targetFolderId: string | null,
        assetsRepository: AssetsRepository
    ): Promise<{ name: string; fileName: string }> {
        const ext = path.extname(originalFileName);
        const baseFileName = path.basename(originalFileName, ext);
        const baseName = originalName.trim();

        // If target is clean and has no collision with original name, we check if original name is taken:
        const existingByName = await assetsRepository.findByNameAndFolder(baseName, targetBrandId, targetFolderId);
        const existingByFileName = await assetsRepository.findByFileNameAndFolder(originalFileName, targetBrandId, targetFolderId);

        if (!existingByName && !existingByFileName) {
            return {
                name: baseName,
                fileName: originalFileName,
            };
        }

        // Generate "- copy", "- copy 2", "- copy 3", etc.
        let counter = 1;
        while (counter < 1000) {
            const copySuffix = counter === 1 ? " - copy" : ` - copy ${counter}`;
            const candidateName = `${baseName}${copySuffix}`;
            const candidateFileName = `${baseFileName}${copySuffix}${ext}`;

            const nameCollision = await assetsRepository.findByNameAndFolder(candidateName, targetBrandId, targetFolderId);
            const fileCollision = await assetsRepository.findByFileNameAndFolder(candidateFileName, targetBrandId, targetFolderId);

            if (!nameCollision && !fileCollision) {
                return {
                    name: candidateName,
                    fileName: candidateFileName,
                };
            }
            counter++;
        }

        // Fallback with timestamp if exceeded
        const timestamp = Date.now();
        return {
            name: `${baseName} - copy ${timestamp}`,
            fileName: `${baseFileName} - copy ${timestamp}${ext}`,
        };
    }

    /**
     * Resolves an available unique name for a folder copy in the target location.
     */
    static async resolveUniqueFolderName(
        originalName: string,
        targetBrandId: string,
        targetParentId: string | null,
        foldersRepository: FoldersRepository
    ): Promise<string> {
        const baseName = originalName.trim();

        const existing = await foldersRepository.findByNameAndParent(baseName, targetBrandId, targetParentId);
        if (!existing) {
            return baseName;
        }

        let counter = 1;
        while (counter < 1000) {
            const copySuffix = counter === 1 ? " - copy" : ` - copy ${counter}`;
            const candidateName = `${baseName}${copySuffix}`;

            const collision = await foldersRepository.findByNameAndParent(candidateName, targetBrandId, targetParentId);
            if (!collision) {
                return candidateName;
            }
            counter++;
        }

        return `${baseName} - copy ${Date.now()}`;
    }
}
