import type { Request, Response, NextFunction } from "express";
import BaseController from "../../../presentation/base.controller.js";
import ResponseHttp from "../../../app/http/response.http.js";
import type { ListFormSubmissionsUseCase } from "../application/list-form-submissions.usecase.js";
import type { GetFormSubmissionUseCase } from "../application/get-form-submission.usecase.js";
import type { UpdateFormSubmissionStatusUseCase } from "../application/update-form-submission-status.usecase.js";
import type { DeleteFormSubmissionUseCase } from "../application/delete-form-submission.usecase.js";

export class FormSubmissionsController extends BaseController {
    constructor(
        private readonly listFormSubmissionsUseCase: ListFormSubmissionsUseCase,
        private readonly getFormSubmissionUseCase: GetFormSubmissionUseCase,
        private readonly updateFormSubmissionStatusUseCase: UpdateFormSubmissionStatusUseCase,
        private readonly deleteFormSubmissionUseCase: DeleteFormSubmissionUseCase
    ) {
        super();
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const submission = await this.getFormSubmissionUseCase.execute(id);

            return res
                .status(200)
                .json(ResponseHttp.success("Form submission fetched successfully", submission));
        } catch (error) {
            next(error);
        }
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search as string | undefined;
            const status = req.query.status as any | undefined;
            const formId = (req.params.formId || req.query.formId) as string | undefined;
            const websiteId = req.query.websiteId as string | undefined;

            const result = await this.listFormSubmissionsUseCase.execute({
                page,
                limit,
                filters: {
                    formId,
                    websiteId,
                    status,
                    search,
                },
            });

            return res
                .status(200)
                .json(
                    ResponseHttp.pagination(
                        "Form submissions fetched successfully",
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

    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            const submission = await this.updateFormSubmissionStatusUseCase.execute(
                id,
                req.body,
                auditContext
            );

            return res
                .status(200)
                .json(ResponseHttp.success("Form submission status updated successfully", submission));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteFormSubmissionUseCase.execute(id, auditContext);

            return res
                .status(200)
                .json(ResponseHttp.success("Form submission deleted successfully", null));
        } catch (error) {
            next(error);
        }
    };
}
