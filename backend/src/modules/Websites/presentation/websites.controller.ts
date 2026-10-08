import type { Request, Response, NextFunction } from "express";
import BaseController from "../../../presentation/base.controller.js";
import ResponseHttp from "../../../app/http/response.http.js";
import type { CreateWebsiteUseCase } from "../application/create-website.usecase.js";
import type { GetWebsiteUseCase } from "../application/get-website.usecase.js";
import type { ListWebsitesUseCase } from "../application/list-websites.usecase.js";
import type { UpdateWebsiteUseCase } from "../application/update-website.usecase.js";
import type { DeleteWebsiteUseCase } from "../application/delete-website.usecase.js";
import type { RegenerateApiKeyUseCase } from "../application/regenerate-api-key.usecase.js";

export class WebsitesController extends BaseController {
    constructor(
        private readonly createWebsiteUseCase: CreateWebsiteUseCase,
        private readonly getWebsiteUseCase: GetWebsiteUseCase,
        private readonly listWebsitesUseCase: ListWebsitesUseCase,
        private readonly updateWebsiteUseCase: UpdateWebsiteUseCase,
        private readonly deleteWebsiteUseCase: DeleteWebsiteUseCase,
        private readonly regenerateApiKeyUseCase: RegenerateApiKeyUseCase
    ) {
        super();
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auditContext = this.getAuditContext(req, res);
            const website = await this.createWebsiteUseCase.execute(req.body, auditContext);
            return res
                .status(201)
                .json(ResponseHttp.success("Website created successfully", website));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const website = await this.getWebsiteUseCase.execute(id);
            return res
                .status(200)
                .json(ResponseHttp.success("Website fetched successfully", website));
        } catch (error) {
            next(error);
        }
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search as string | undefined;
            const ownerId = req.query.ownerId as string | undefined;
            const isActive =
                req.query.isActive !== undefined
                    ? String(req.query.isActive) === "true"
                    : undefined;

            const result = await this.listWebsitesUseCase.execute({
                page,
                limit,
                filters: {
                    search,
                    isActive,
                    ownerId,
                },
            });

            return res
                .status(200)
                .json(
                    ResponseHttp.pagination(
                        "Websites fetched successfully",
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
            const website = await this.updateWebsiteUseCase.execute(id, req.body, auditContext);
            return res
                .status(200)
                .json(ResponseHttp.success("Website updated successfully", website));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteWebsiteUseCase.execute(id, auditContext);
            return res
                .status(200)
                .json(ResponseHttp.success("Website deleted successfully", null));
        } catch (error) {
            next(error);
        }
    };

    regenerateApiKey = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            const website = await this.regenerateApiKeyUseCase.execute(id, auditContext);
            return res
                .status(200)
                .json(ResponseHttp.success("API key regenerated successfully", website));
        } catch (error) {
            next(error);
        }
    };
}
