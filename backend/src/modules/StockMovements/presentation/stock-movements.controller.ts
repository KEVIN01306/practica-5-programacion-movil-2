import type { Request, Response, NextFunction } from "express";
import ResponseHttp from "@app/http/response.http.js";
import BaseController from "@presentation/base.controller.js";
import type { RegisterMovementUseCase } from "../application/register-movement.usecase.js";
import type { ListMovementsUseCase } from "../application/list-movements.usecase.js";
import type { GetProductMovementsUseCase } from "../application/get-product-movements.usecase.js";
import type { MovementType } from "@prisma/client";

export class StockMovementsController extends BaseController {
    constructor(
        private readonly registerMovementUseCase: RegisterMovementUseCase,
        private readonly listMovementsUseCase: ListMovementsUseCase,
        private readonly getProductMovementsUseCase: GetProductMovementsUseCase
    ) {
        super();
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userCtx = (req as any).user || res.locals.user;
            const userId = userCtx.id;

            const movement = await this.registerMovementUseCase.execute({
                ...req.body,
                userId,
            });

            return res.status(201).json(ResponseHttp.success("Stock movement registered successfully", movement));
        } catch (error) {
            next(error);
        }
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
            const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : 10;
            const productId = req.query.productId ? String(req.query.productId) : undefined;
            const type = req.query.type ? (req.query.type as MovementType) : undefined;
            const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
            const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
            const offset = (page - 1) * limit;

            const { data, total } = await this.listMovementsUseCase.execute({
                page,
                limit,
                productId,
                type,
                startDate,
                endDate,
            });

            return res.status(200).json(
                ResponseHttp.pagination("Stock movements retrieved successfully", data, total, limit, offset)
            );
        } catch (error) {
            next(error);
        }
    };

    getByProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId = req.params.productId as string;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

            const history = await this.getProductMovementsUseCase.execute(productId, limit);
            return res.status(200).json(ResponseHttp.success("Product movements retrieved successfully", history));
        } catch (error) {
            next(error);
        }
    };
}
