import { PrismaFoldersRepository } from "./infrastructure/prisma-folders.repository.js";
import { CreateFolderUseCase } from "./application/create-folder.usecase.js";
import { ListFoldersUseCase } from "./application/list-folders.usecase.js";
import { GetFolderUseCase } from "./application/get-folder.usecase.js";
import { UpdateFolderUseCase } from "./application/update-folder.usecase.js";
import { DeleteFolderUseCase } from "./application/delete-folder.usecase.js";
import { CopyFolderUseCase } from "./application/copy-folder.usecase.js";
import { FoldersController } from "./presentation/folders.controller.js";
export declare const foldersRepository: PrismaFoldersRepository;
export declare const createFolderUseCase: CreateFolderUseCase;
export declare const listFoldersUseCase: ListFoldersUseCase;
export declare const getFolderUseCase: GetFolderUseCase;
export declare const updateFolderUseCase: UpdateFolderUseCase;
export declare const deleteFolderUseCase: DeleteFolderUseCase;
export declare const copyFolderUseCase: CopyFolderUseCase;
export declare const foldersController: FoldersController;
//# sourceMappingURL=folders.module.d.ts.map