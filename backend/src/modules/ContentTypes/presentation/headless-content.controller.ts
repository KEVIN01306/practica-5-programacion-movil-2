import type { Request, Response, NextFunction } from "express";
import type { GetHeadlessContentUseCase } from "../application/get-headless-content.usecase.js";
import type { ListContentTypesUseCase } from "../application/list-content-types.usecase.js";
import type { GetContentItemUseCase } from "../application/get-content-item.usecase.js";
import AppError from "../../../shared/errors/AppError.js";

export class HeadlessContentController {
    constructor(
        private readonly getHeadlessContentUseCase: GetHeadlessContentUseCase,
        private readonly listContentTypesUseCase: ListContentTypesUseCase,
        private readonly getContentItemUseCase: GetContentItemUseCase
    ) {}

    getContentBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const website = req.website;
            if (!website) {
                throw new AppError("Website context is missing", "WEBSITE_REQUIRED", 401);
            }

            const slug = req.params.slug as string;
            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
            const includeSchema = req.query.includeSchema === "true";

            // Extract custom field filters (ignore standard system query params)
            const SYSTEM_PARAMS = new Set([
                "page",
                "limit",
                "includeSchema",
                "sort",
                "order",
                "apiKey",
                "search",
            ]);

            const customFilters: Record<string, any> = {};
            for (const [key, value] of Object.entries(req.query)) {
                if (!SYSTEM_PARAMS.has(key) && value !== undefined && value !== "") {
                    customFilters[key] = value;
                }
            }

            const result = await this.getHeadlessContentUseCase.execute({
                websiteId: website.id,
                contentTypeSlug: slug,
                page,
                limit,
                includeSchema,
                filters: customFilters,
            });

            res.status(200).json({
                status: "success",
                message: `Content for '${slug}' retrieved successfully`,
                website: {
                    id: website.id,
                    name: website.name,
                    domain: website.domain,
                },
                ...result,
            });
        } catch (error) {
            next(error);
        }
    };

    listAvailableTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const website = req.website;
            if (!website) {
                throw new AppError("Website context is missing", "WEBSITE_REQUIRED", 401);
            }

            const result = await this.listContentTypesUseCase.execute({
                filters: {
                    websiteId: website.id,
                },
                limit: 100,
            });

            res.status(200).json({
                status: "success",
                message: "Available content types retrieved",
                website: {
                    id: website.id,
                    name: website.name,
                    domain: website.domain,
                },
                data: result.data.map((ct) => ({
                    id: ct.id,
                    name: ct.name,
                    slug: ct.slug,
                    description: ct.description,
                    fieldsCount: ct.fieldsCount,
                    itemsCount: ct.itemsCount,
                })),
                count: result.total,
            });
        } catch (error) {
            next(error);
        }
    };

    getItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const website = req.website;
            if (!website) {
                throw new AppError("Website context is missing", "WEBSITE_REQUIRED", 401);
            }

            const id = req.params.id as string;
            const item = await this.getContentItemUseCase.execute(id);

            if (!item || !item.isPublished) {
                throw new AppError("Content item not found or unpublished", "ITEM_NOT_FOUND", 404);
            }

            res.status(200).json({
                status: "success",
                message: "Content item retrieved successfully",
                data: {
                    id: item.id,
                    data: item.data,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                },
            });
        } catch (error) {
            next(error);
        }
    };
}
