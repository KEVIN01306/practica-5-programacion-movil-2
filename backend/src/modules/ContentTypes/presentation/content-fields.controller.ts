import type { Request, Response, NextFunction } from "express";
import BaseController from "../../../presentation/base.controller.js";
import ResponseHttp from "../../../app/http/response.http.js";
import type { CreateContentFieldUseCase } from "../application/create-content-field.usecase.js";
import type { GetContentFieldUseCase } from "../application/get-content-field.usecase.js";
import type { ListContentFieldsUseCase } from "../application/list-content-fields.usecase.js";
import type { UpdateContentFieldUseCase } from "../application/update-content-field.usecase.js";
import type { DeleteContentFieldUseCase } from "../application/delete-content-field.usecase.js";
import type { BulkCreateContentFieldsUseCase } from "../application/bulk-create-content-fields.usecase.js";

export class ContentFieldsController extends BaseController {
    constructor(
        private readonly createContentFieldUseCase: CreateContentFieldUseCase,
        private readonly getContentFieldUseCase: GetContentFieldUseCase,
        private readonly listContentFieldsUseCase: ListContentFieldsUseCase,
        private readonly updateContentFieldUseCase: UpdateContentFieldUseCase,
        private readonly deleteContentFieldUseCase: DeleteContentFieldUseCase,
        private readonly bulkCreateContentFieldsUseCase: BulkCreateContentFieldsUseCase
    ) {
        super();
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auditContext = this.getAuditContext(req, res);
            const contentTypeId = req.params.contentTypeId || req.body.contentTypeId;
            const field = await this.createContentFieldUseCase.execute(
                { ...req.body, contentTypeId },
                auditContext
            );
            return res
                .status(201)
                .json(ResponseHttp.success("Content field created successfully", field));
        } catch (error) {
            next(error);
        }
    };

    bulkCreate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auditContext = this.getAuditContext(req, res);
            const contentTypeId = req.params.contentTypeId as string;
            const fieldsInput = Array.isArray(req.body)
                ? req.body
                : Array.isArray(req.body.fields)
                ? req.body.fields
                : [req.body];

            const result = await this.bulkCreateContentFieldsUseCase.execute(
                {
                    contentTypeId,
                    fields: fieldsInput,
                },
                auditContext
            );

            return res
                .status(201)
                .json(
                    ResponseHttp.success(
                        `Bulk created ${result.totalCreated} fields (${result.skipped.length} skipped)`,
                        result
                    )
                );
        } catch (error) {
            next(error);
        }
    };

    exportJson = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const contentTypeId = req.params.contentTypeId as string;
            const fields = await this.listContentFieldsUseCase.execute(contentTypeId);

            const exportPayload = fields.map((f) => ({
                name: f.name,
                key: f.key,
                type: f.type,
                isRequired: f.isRequired,
            }));

            res.setHeader("Content-Type", "application/json");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="schema-${contentTypeId}.json"`
            );
            return res.status(200).send(JSON.stringify(exportPayload, null, 2));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const field = await this.getContentFieldUseCase.execute(id);
            return res
                .status(200)
                .json(ResponseHttp.success("Content field fetched successfully", field));
        } catch (error) {
            next(error);
        }
    };

    listByContentType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const contentTypeId = req.params.contentTypeId as string;
            const fields = await this.listContentFieldsUseCase.execute(contentTypeId);
            return res
                .status(200)
                .json(ResponseHttp.success("Content fields fetched successfully", fields));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            const field = await this.updateContentFieldUseCase.execute(id, req.body, auditContext);
            return res
                .status(200)
                .json(ResponseHttp.success("Content field updated successfully", field));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteContentFieldUseCase.execute(id, auditContext);
            return res
                .status(200)
                .json(ResponseHttp.success("Content field deleted successfully", null));
        } catch (error) {
            next(error);
        }
    };
}

