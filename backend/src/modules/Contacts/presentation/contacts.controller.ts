import type { Request, Response, NextFunction } from "express";
import type { ListContactsUseCase } from "../application/list-contacts.usecase.js";
import type { GetContactUseCase } from "../application/get-contact.usecase.js";
import type { CreateContactUseCase } from "../application/create-contact.usecase.js";
import type { UpdateContactUseCase } from "../application/update-contact.usecase.js";
import type { DeleteContactUseCase } from "../application/delete-contact.usecase.js";

export class ContactsController {
    constructor(
        private readonly listContactsUseCase: ListContactsUseCase,
        private readonly getContactUseCase: GetContactUseCase,
        private readonly createContactUseCase: CreateContactUseCase,
        private readonly updateContactUseCase: UpdateContactUseCase,
        private readonly deleteContactUseCase: DeleteContactUseCase
    ) {}

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.listContactsUseCase.execute({
                page: (req as any).validatedQuery?.page,
                limit: (req as any).validatedQuery?.limit,
                filters: {
                    websiteId: (req as any).validatedQuery?.websiteId,
                    search: (req as any).validatedQuery?.search,
                    status: (req as any).validatedQuery?.status,
                },
            });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = (req as any).validatedParams || req.params;
            const contact = await this.getContactUseCase.execute(id);
            res.status(200).json(contact);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = (req as any).validatedBody || req.body;
            const auditContext = {
                userId: (req as any).user?.id,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            };
            const contact = await this.createContactUseCase.execute(body, auditContext);
            res.status(201).json(contact);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = (req as any).validatedParams || req.params;
            const body = (req as any).validatedBody || req.body;
            const auditContext = {
                userId: (req as any).user?.id,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            };
            const contact = await this.updateContactUseCase.execute(id, body, auditContext);
            res.status(200).json(contact);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = (req as any).validatedParams || req.params;
            const auditContext = {
                userId: (req as any).user?.id,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            };
            await this.deleteContactUseCase.execute(id, auditContext);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
