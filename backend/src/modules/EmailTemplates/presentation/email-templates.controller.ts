import type { Request, Response, NextFunction } from "express";
import BaseController from "../../../presentation/base.controller.js";
import ResponseHttp from "../../../app/http/response.http.js";
import type { CreateEmailTemplateUseCase } from "../application/create-email-template.usecase.js";
import type { GetEmailTemplateUseCase } from "../application/get-email-template.usecase.js";
import type { ListEmailTemplatesUseCase } from "../application/list-email-templates.usecase.js";
import type { UpdateEmailTemplateUseCase } from "../application/update-email-template.usecase.js";
import type { DeleteEmailTemplateUseCase } from "../application/delete-email-template.usecase.js";
import AppError from "../../../shared/errors/AppError.js";

export class EmailTemplatesController extends BaseController {
    constructor(
        private readonly createEmailTemplateUseCase: CreateEmailTemplateUseCase,
        private readonly getEmailTemplateUseCase: GetEmailTemplateUseCase,
        private readonly listEmailTemplatesUseCase: ListEmailTemplatesUseCase,
        private readonly updateEmailTemplateUseCase: UpdateEmailTemplateUseCase,
        private readonly deleteEmailTemplateUseCase: DeleteEmailTemplateUseCase
    ) {
        super();
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auditContext = this.getAuditContext(req, res);
            const websiteId = req.params.websiteId || req.body.websiteId;

            if (!websiteId) {
                throw new AppError("websiteId is required", "VALIDATION_ERROR", 400);
            }

            const emailTemplate = await this.createEmailTemplateUseCase.execute(
                { ...req.body, websiteId },
                auditContext
            );

            return res
                .status(201)
                .json(ResponseHttp.success("Email template created successfully", emailTemplate));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const emailTemplate = await this.getEmailTemplateUseCase.execute(id);
            return res
                .status(200)
                .json(ResponseHttp.success("Email template fetched successfully", emailTemplate));
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

            const result = await this.listEmailTemplatesUseCase.execute({
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
                        "Email templates fetched successfully",
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
            const emailTemplate = await this.updateEmailTemplateUseCase.execute(
                id,
                req.body,
                auditContext
            );

            return res
                .status(200)
                .json(ResponseHttp.success("Email template updated successfully", emailTemplate));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteEmailTemplateUseCase.execute(id, auditContext);
            return res
                .status(200)
                .json(ResponseHttp.success("Email template deleted successfully", null));
        } catch (error) {
            next(error);
        }
    };
}
