import type { Request, Response, NextFunction } from "express";
import BaseController from "../../../presentation/base.controller.js";
import type { CreateAssetUseCase } from "../application/create-asset.usecase.js";
import type { ListAssetsUseCase } from "../application/list-assets.usecase.js";
import type { GetAssetUseCase } from "../application/get-asset.usecase.js";
import type { UpdateAssetUseCase } from "../application/update-asset.usecase.js";
import type { DeleteAssetUseCase } from "../application/delete-asset.usecase.js";
import type { CopyAssetUseCase } from "../application/copy-asset.usecase.js";
export declare class AssetsController extends BaseController {
    private readonly createAssetUseCase;
    private readonly listAssetsUseCase;
    private readonly getAssetUseCase;
    private readonly updateAssetUseCase;
    private readonly deleteAssetUseCase;
    private readonly copyAssetUseCase;
    constructor(createAssetUseCase: CreateAssetUseCase, listAssetsUseCase: ListAssetsUseCase, getAssetUseCase: GetAssetUseCase, updateAssetUseCase: UpdateAssetUseCase, deleteAssetUseCase: DeleteAssetUseCase, copyAssetUseCase: CopyAssetUseCase);
    create: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    list: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    copy: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=assets.controller.d.ts.map