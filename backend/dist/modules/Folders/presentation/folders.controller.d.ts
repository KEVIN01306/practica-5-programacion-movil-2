import type { Request, Response, NextFunction } from "express";
import BaseController from "../../../presentation/base.controller.js";
import type { CreateFolderUseCase } from "../application/create-folder.usecase.js";
import type { ListFoldersUseCase } from "../application/list-folders.usecase.js";
import type { GetFolderUseCase } from "../application/get-folder.usecase.js";
import type { UpdateFolderUseCase } from "../application/update-folder.usecase.js";
import type { DeleteFolderUseCase } from "../application/delete-folder.usecase.js";
import type { CopyFolderUseCase } from "../application/copy-folder.usecase.js";
export declare class FoldersController extends BaseController {
    private readonly createFolderUseCase;
    private readonly listFoldersUseCase;
    private readonly getFolderUseCase;
    private readonly updateFolderUseCase;
    private readonly deleteFolderUseCase;
    private readonly copyFolderUseCase;
    constructor(createFolderUseCase: CreateFolderUseCase, listFoldersUseCase: ListFoldersUseCase, getFolderUseCase: GetFolderUseCase, updateFolderUseCase: UpdateFolderUseCase, deleteFolderUseCase: DeleteFolderUseCase, copyFolderUseCase: CopyFolderUseCase);
    create: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    list: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    copy: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=folders.controller.d.ts.map