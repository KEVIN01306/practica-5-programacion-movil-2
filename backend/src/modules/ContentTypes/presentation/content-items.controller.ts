import type { Request, Response, NextFunction } from "express";
import BaseController from "../../../presentation/base.controller.js";
import ResponseHttp from "../../../app/http/response.http.js";
import type { CreateContentItemUseCase } from "../application/create-content-item.usecase.js";
import type { BulkCreateContentItemsUseCase } from "../application/bulk-create-content-items.usecase.js";
import type { GetContentItemUseCase } from "../application/get-content-item.usecase.js";
import type { ListContentItemsUseCase } from "../application/list-content-items.usecase.js";
import type { UpdateContentItemUseCase } from "../application/update-content-item.usecase.js";
import type { DeleteContentItemUseCase } from "../application/delete-content-item.usecase.js";

export class ContentItemsController extends BaseController {
    constructor(
        private readonly createContentItemUseCase: CreateContentItemUseCase,
        private readonly bulkCreateContentItemsUseCase: BulkCreateContentItemsUseCase,
        private readonly getContentItemUseCase: GetContentItemUseCase,
        private readonly listContentItemsUseCase: ListContentItemsUseCase,
        private readonly updateContentItemUseCase: UpdateContentItemUseCase,
        private readonly deleteContentItemUseCase: DeleteContentItemUseCase
    ) {
        super();
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auditContext = this.getAuditContext(req, res);
            const contentTypeId = req.params.contentTypeId || req.body.contentTypeId;
            const item = await this.createContentItemUseCase.execute(
                { ...req.body, contentTypeId },
                auditContext
            );
            return res
                .status(201)
                .json(ResponseHttp.success("Content item created successfully", item));
        } catch (error) {
            next(error);
        }
    };

    bulkCreate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auditContext = this.getAuditContext(req, res);
            const contentTypeId = req.params.contentTypeId || req.body.contentTypeId;

            let rawItems: any[] = [];
            let defaultPublished = true;

            if (Array.isArray(req.body)) {
                rawItems = req.body;
            } else if (req.body && Array.isArray(req.body.items)) {
                rawItems = req.body.items;
                if (req.body.isPublished !== undefined) {
                    defaultPublished = req.body.isPublished;
                }
            }

            const formattedItems = rawItems.map((entry) => {
                // If entry has a nested 'data' property, use it; otherwise treat entry as the data payload
                const itemData = entry.data && typeof entry.data === "object" ? entry.data : entry;
                const isPublished =
                    entry.isPublished !== undefined ? entry.isPublished : defaultPublished;
                return {
                    data: itemData,
                    isPublished,
                };
            });

            const result = await this.bulkCreateContentItemsUseCase.execute(
                {
                    contentTypeId,
                    items: formattedItems,
                },
                auditContext
            );

            return res
                .status(201)
                .json(
                    ResponseHttp.success(
                        `Successfully imported ${result.count} content items`,
                        result
                    )
                );
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const item = await this.getContentItemUseCase.execute(id);
            return res
                .status(200)
                .json(ResponseHttp.success("Content item fetched successfully", item));
        } catch (error) {
            next(error);
        }
    };

    listByContentType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const contentTypeId = req.params.contentTypeId as string;
            const isPublished =
                req.query.isPublished !== undefined
                    ? String(req.query.isPublished) === "true"
                    : undefined;

            const result = await this.listContentItemsUseCase.execute({
                page,
                limit,
                filters: {
                    contentTypeId,
                    isPublished,
                },
            });

            return res
                .status(200)
                .json(
                    ResponseHttp.pagination(
                        "Content items fetched successfully",
                        result.data,
                        result.total,
                        limit,
                        (page - 1) * limit
                    )
                );
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            const item = await this.updateContentItemUseCase.execute(id, req.body, auditContext);
            return res
                .status(200)
                .json(ResponseHttp.success("Content item updated successfully", item));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteContentItemUseCase.execute(id, auditContext);
            return res
                .status(200)
                .json(ResponseHttp.success("Content item deleted successfully", null));
        } catch (error) {
            next(error);
        }
    };
}
