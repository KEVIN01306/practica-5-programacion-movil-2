import type { Request, Response, NextFunction } from "express";
import ResponseHttp from "@app/http/response.http.js";
import BaseController from "@presentation/base.controller.js";
import type { CreateFolderUseCase } from "../application/create-folder.usecase.js";
import type { ListFoldersUseCase } from "../application/list-folders.usecase.js";
import type { GetFolderUseCase } from "../application/get-folder.usecase.js";
import type { UpdateFolderUseCase } from "../application/update-folder.usecase.js";
import type { DeleteFolderUseCase } from "../application/delete-folder.usecase.js";
import type { CopyFolderUseCase } from "../application/copy-folder.usecase.js";
import type { GetFolder } from "../domain/folder.entity.js";

export class FoldersController extends BaseController {
    constructor(
        private readonly createFolderUseCase: CreateFolderUseCase,
        private readonly listFoldersUseCase: ListFoldersUseCase,
        private readonly getFolderUseCase: GetFolderUseCase,
        private readonly updateFolderUseCase: UpdateFolderUseCase,
        private readonly deleteFolderUseCase: DeleteFolderUseCase,
        private readonly copyFolderUseCase: CopyFolderUseCase
    ) {
        super();
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const auditContext = this.getAuditContext(req, res);
            const folder = await this.createFolderUseCase.execute(data, auditContext);
            return res.status(201).json(ResponseHttp.success("Folder created successfully", folder));
        } catch (error) {
            next(error);
        }
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const brandId = req.query.brandId ? String(req.query.brandId) : undefined;
            const parentIdParam = req.query.parentId;
            const parentId = parentIdParam === undefined
                ? undefined
                : (parentIdParam === "null" || parentIdParam === "" ? null : String(parentIdParam));
            const q = req.query.q ? String(req.query.q) : undefined;
            const all = req.query.all === "true";

            if (all) {
                const folders = await this.listFoldersUseCase.execute({ brandId, parentId, all: true });
                return res.status(200).json(ResponseHttp.success("Folders fetched successfully", folders));
            }

            const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
            const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : 10;
            const offset = (page - 1) * limit;

            const result = await this.listFoldersUseCase.execute({ brandId, parentId, page, limit, q }) as { data: GetFolder[]; total: number };
            return res.status(200).json(ResponseHttp.pagination("Folders fetched successfully", result.data, result.total, limit, offset));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const folder = await this.getFolderUseCase.execute(id);
            return res.status(200).json(ResponseHttp.success("Folder fetched successfully", folder));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const data = req.body;
            const auditContext = this.getAuditContext(req, res);
            const folder = await this.updateFolderUseCase.execute(id, data, auditContext);
            return res.status(200).json(ResponseHttp.success("Folder updated successfully", folder));
        } catch (error) {
            next(error);
        }
    };

    copy = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            let targetParentId: string | null = null;
            if (req.body.targetParentId && req.body.targetParentId !== "null" && req.body.targetParentId !== "") {
                targetParentId = req.body.targetParentId;
            }

            const folder = await this.copyFolderUseCase.execute(
                id,
                {
                    targetBrandId: req.body.targetBrandId,
                    targetParentId,
                },
                auditContext
            );

            return res.status(201).json(ResponseHttp.success("Folder copied successfully", folder));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteFolderUseCase.execute(id, auditContext);
            return res.status(200).json(ResponseHttp.success("Folder deleted successfully", null));
        } catch (error) {
            next(error);
        }
    };
}

