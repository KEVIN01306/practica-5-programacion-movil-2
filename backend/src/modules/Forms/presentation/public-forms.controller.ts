import type { Request, Response, NextFunction } from "express";
import type { SubmitPublicFormUseCase } from "../application/submit-public-form.usecase.js";
import AppError from "../../../shared/errors/AppError.js";

export class PublicFormsController {
    constructor(private readonly submitPublicFormUseCase: SubmitPublicFormUseCase) {}

    submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const website = req.website;
            if (!website) {
                throw new AppError("Website context is missing", "WEBSITE_REQUIRED", 401);
            }

            const slug = req.params.slug as string;
            const payload = req.body;

            if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
                throw new AppError(
                    "Request body must be a JSON object containing form fields",
                    "INVALID_PAYLOAD",
                    400
                );
            }

            const submission = await this.submitPublicFormUseCase.execute({
                websiteId: website.id,
                slug,
                payload,
            });

            res.status(201).json({
                status: "success",
                message: "Form submitted successfully",
                data: {
                    id: submission.id,
                    status: submission.status,
                    createdAt: submission.createdAt,
                },
            });
        } catch (error) {
            next(error);
        }
    };
}
