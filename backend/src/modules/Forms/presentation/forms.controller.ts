import type { Request, Response, NextFunction } from "express";
import BaseController from "../../../presentation/base.controller.js";
import ResponseHttp from "../../../app/http/response.http.js";
import type { CreateFormUseCase } from "../application/create-form.usecase.js";
import type { GetFormUseCase } from "../application/get-form.usecase.js";
import type { ListFormsUseCase } from "../application/list-forms.usecase.js";
import type { UpdateFormUseCase } from "../application/update-form.usecase.js";
import type { DeleteFormUseCase } from "../application/delete-form.usecase.js";
import AppError from "../../../shared/errors/AppError.js";

export class FormsController extends BaseController {
    constructor(
        private readonly createFormUseCase: CreateFormUseCase,
        private readonly getFormUseCase: GetFormUseCase,
        private readonly listFormsUseCase: ListFormsUseCase,
        private readonly updateFormUseCase: UpdateFormUseCase,
        private readonly deleteFormUseCase: DeleteFormUseCase
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

            const form = await this.createFormUseCase.execute(
                { ...req.body, websiteId },
                auditContext
            );

            return res
                .status(201)
                .json(ResponseHttp.success("Form created successfully", form));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const form = await this.getFormUseCase.execute(id);
            return res
                .status(200)
                .json(ResponseHttp.success("Form fetched successfully", form));
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

            const result = await this.listFormsUseCase.execute({
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
                        "Forms fetched successfully",
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
            const form = await this.updateFormUseCase.execute(id, req.body, auditContext);

            return res
                .status(200)
                .json(ResponseHttp.success("Form updated successfully", form));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteFormUseCase.execute(id, auditContext);

            return res
                .status(200)
                .json(ResponseHttp.success("Form deleted successfully", null));
        } catch (error) {
            next(error);
        }
    };
}
