import type { Request, Response, NextFunction } from "express";
import BaseController from "../../../presentation/base.controller.js";
import ResponseHttp from "../../../app/http/response.http.js";
import type { CreateContentTypeUseCase } from "../application/create-content-type.usecase.js";
import type { GetContentTypeUseCase } from "../application/get-content-type.usecase.js";
import type { ListContentTypesUseCase } from "../application/list-content-types.usecase.js";
import type { UpdateContentTypeUseCase } from "../application/update-content-type.usecase.js";
import type { DeleteContentTypeUseCase } from "../application/delete-content-type.usecase.js";

export class ContentTypesController extends BaseController {
    constructor(
        private readonly createContentTypeUseCase: CreateContentTypeUseCase,
        private readonly getContentTypeUseCase: GetContentTypeUseCase,
        private readonly listContentTypesUseCase: ListContentTypesUseCase,
        private readonly updateContentTypeUseCase: UpdateContentTypeUseCase,
        private readonly deleteContentTypeUseCase: DeleteContentTypeUseCase
    ) {
        super();
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auditContext = this.getAuditContext(req, res);
            const websiteId = req.params.websiteId || req.body.websiteId;
            const contentType = await this.createContentTypeUseCase.execute(
                { ...req.body, websiteId },
                auditContext
            );
            return res
                .status(201)
                .json(ResponseHttp.success("Content type created successfully", contentType));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const contentType = await this.getContentTypeUseCase.execute(id);
            return res
                .status(200)
                .json(ResponseHttp.success("Content type fetched successfully", contentType));
        } catch (error) {
            next(error);
        }
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search as string | undefined;
            const websiteId = (req.params.websiteId || req.query.websiteId) as string | undefined;

            const result = await this.listContentTypesUseCase.execute({
                page,
                limit,
                filters: {
                    search,
                    websiteId,
                },
            });

            return res
                .status(200)
                .json(
                    ResponseHttp.pagination(
                        "Content types fetched successfully",
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
            const contentType = await this.updateContentTypeUseCase.execute(id, req.body, auditContext);
            return res
                .status(200)
                .json(ResponseHttp.success("Content type updated successfully", contentType));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteContentTypeUseCase.execute(id, auditContext);
            return res
                .status(200)
                .json(ResponseHttp.success("Content type deleted successfully", null));
        } catch (error) {
            next(error);
        }
    };
}
