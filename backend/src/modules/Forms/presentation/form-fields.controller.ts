import type { Request, Response, NextFunction } from "express";
import BaseController from "../../../presentation/base.controller.js";
import ResponseHttp from "../../../app/http/response.http.js";
import type { CreateFormFieldUseCase } from "../application/create-form-field.usecase.js";
import type { GetFormFieldUseCase } from "../application/get-form-field.usecase.js";
import type { ListFormFieldsUseCase } from "../application/list-form-fields.usecase.js";
import type { UpdateFormFieldUseCase } from "../application/update-form-field.usecase.js";
import type { DeleteFormFieldUseCase } from "../application/delete-form-field.usecase.js";
import type { BulkCreateFormFieldsUseCase } from "../application/bulk-create-form-fields.usecase.js";

export class FormFieldsController extends BaseController {
    constructor(
        private readonly createFormFieldUseCase: CreateFormFieldUseCase,
        private readonly getFormFieldUseCase: GetFormFieldUseCase,
        private readonly listFormFieldsUseCase: ListFormFieldsUseCase,
        private readonly updateFormFieldUseCase: UpdateFormFieldUseCase,
        private readonly deleteFormFieldUseCase: DeleteFormFieldUseCase,
        private readonly bulkCreateFormFieldsUseCase: BulkCreateFormFieldsUseCase
    ) {
        super();
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auditContext = this.getAuditContext(req, res);
            const formId = req.params.formId || req.body.formId;

            const field = await this.createFormFieldUseCase.execute(
                { ...req.body, formId },
                auditContext
            );

            return res
                .status(201)
                .json(ResponseHttp.success("Form field created successfully", field));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const field = await this.getFormFieldUseCase.execute(id);

            return res
                .status(200)
                .json(ResponseHttp.success("Form field fetched successfully", field));
        } catch (error) {
            next(error);
        }
    };

    listByForm = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const formId = req.params.formId as string;
            const fields = await this.listFormFieldsUseCase.execute(formId);

            return res
                .status(200)
                .json(ResponseHttp.success("Form fields fetched successfully", fields));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            const field = await this.updateFormFieldUseCase.execute(id, req.body, auditContext);

            return res
                .status(200)
                .json(ResponseHttp.success("Form field updated successfully", field));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteFormFieldUseCase.execute(id, auditContext);

            return res
                .status(200)
                .json(ResponseHttp.success("Form field deleted successfully", null));
        } catch (error) {
            next(error);
        }
    };

    bulkCreate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const formId = req.params.formId as string;
            const auditContext = this.getAuditContext(req, res);
            const fields = await this.bulkCreateFormFieldsUseCase.execute(
                formId,
                req.body.fields,
                auditContext
            );

            return res
                .status(201)
                .json(ResponseHttp.success("Form fields bulk created successfully", fields));
        } catch (error) {
            next(error);
        }
    };
}
