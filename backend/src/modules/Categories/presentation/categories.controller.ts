import type { Request, Response, NextFunction } from "express";
import ResponseHttp from "@app/http/response.http.js";
import BaseController from "@presentation/base.controller.js";
import type { CreateCategoryUseCase } from "../application/create-category.usecase.js";
import type { UpdateCategoryUseCase } from "../application/update-category.usecase.js";
import type { GetCategoryUseCase } from "../application/get-category.usecase.js";
import type { ListCategoriesUseCase } from "../application/list-categories.usecase.js";
import type { DeleteCategoryUseCase } from "../application/delete-category.usecase.js";

export class CategoriesController extends BaseController {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly updateCategoryUseCase: UpdateCategoryUseCase,
        private readonly getCategoryUseCase: GetCategoryUseCase,
        private readonly listCategoriesUseCase: ListCategoriesUseCase,
        private readonly deleteCategoryUseCase: DeleteCategoryUseCase
    ) {
        super();
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.createCategoryUseCase.execute(req.body);
            return res.status(201).json(ResponseHttp.success("Category created successfully", result));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const result = await this.updateCategoryUseCase.execute(id, req.body);
            return res.status(200).json(ResponseHttp.success("Category updated successfully", result));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const result = await this.getCategoryUseCase.execute(id);
            return res.status(200).json(ResponseHttp.success("Category retrieved successfully", result));
        } catch (error) {
            next(error);
        }
    };

    list = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.listCategoriesUseCase.execute();
            return res.status(200).json(ResponseHttp.success("Categories retrieved successfully", result));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await this.deleteCategoryUseCase.execute(id);
            return res.status(200).json(ResponseHttp.success("Category deleted successfully", null));
        } catch (error) {
            next(error);
        }
    };
}
