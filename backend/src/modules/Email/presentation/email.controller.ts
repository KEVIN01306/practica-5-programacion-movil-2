import type { Request, Response, NextFunction } from 'express';
import BaseController from '../../../presentation/base.controller.js';
import ResponseHttp from '../../../app/http/response.http.js';
import type { SendEmailUseCase } from '../application/send-email.usecase.js';

export class EmailController extends BaseController {
    constructor(private readonly sendEmailUseCase: SendEmailUseCase) {
        super();
    }

    sendEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auditContext = this.getAuditContext(req, res);
            const { to, subject, html, text, from, replyTo } = req.body;

            const result = await this.sendEmailUseCase.execute({
                to,
                subject,
                html,
                text,
                from,
                replyTo,
                userId: auditContext?.userId || null,
            });

            return res
                .status(200)
                .json(ResponseHttp.success('Email dispatched successfully', result));
        } catch (error) {
            next(error);
        }
    };
}
