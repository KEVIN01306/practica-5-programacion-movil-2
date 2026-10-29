import type { Request, Response, NextFunction } from "express";
import ResponseHttp from "@app/http/response.http.js";
import BaseController from "@presentation/base.controller.js";
import type { CreateProductUseCase } from "../application/create-product.usecase.js";
import type { UpdateProductUseCase } from "../application/update-product.usecase.js";
import type { GetProductUseCase } from "../application/get-product.usecase.js";
import type { GetProductByCodeUseCase } from "../application/get-product-by-code.usecase.js";
import type { ListProductsUseCase } from "../application/list-products.usecase.js";
import type { DeleteProductUseCase } from "../application/delete-product.usecase.js";
import type { GenerateProductCodeUseCase } from "../application/generate-product-code.usecase.js";
import type { GetProductLabelUseCase } from "../application/get-product-label.usecase.js";

export class ProductsController extends BaseController {
    constructor(
        private readonly createProductUseCase: CreateProductUseCase,
        private readonly updateProductUseCase: UpdateProductUseCase,
        private readonly getProductUseCase: GetProductUseCase,
        private readonly getProductByCodeUseCase: GetProductByCodeUseCase,
        private readonly listProductsUseCase: ListProductsUseCase,
        private readonly deleteProductUseCase: DeleteProductUseCase,
        private readonly generateProductCodeUseCase?: GenerateProductCodeUseCase,
        private readonly getProductLabelUseCase?: GetProductLabelUseCase
    ) {
        super();
    }

    generateCode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!this.generateProductCodeUseCase) {
                return res.status(500).json(ResponseHttp.error("Generate code service not configured", "SERVER_ERROR"));
            }
            const prefix = (req.query.prefix as string) || "PRD";
            const code = await this.generateProductCodeUseCase.execute(prefix);
            return res.status(200).json(ResponseHttp.success("Product code generated", { code }));
        } catch (error) {
            next(error);
        }
    };

    getLabel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!this.getProductLabelUseCase) {
                return res.status(500).json(ResponseHttp.error("Get label service not configured", "SERVER_ERROR"));
            }
            const id = req.params.id as string;
            const label = await this.getProductLabelUseCase.execute(id);
            return res.status(200).json(ResponseHttp.success("Product label generated successfully", label));
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const product = await this.createProductUseCase.execute(req.body);
            return res.status(201).json(ResponseHttp.success("Product created successfully", product));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const product = await this.updateProductUseCase.execute(id, req.body);
            return res.status(200).json(ResponseHttp.success("Product updated successfully", product));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const product = await this.getProductUseCase.execute(id);
            return res.status(200).json(ResponseHttp.success("Product retrieved successfully", product));
        } catch (error) {
            next(error);
        }
    };

    getByCode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const code = req.params.code as string;
            const product = await this.getProductByCodeUseCase.execute(code);
            return res.status(200).json(ResponseHttp.success("Product retrieved successfully", product));
        } catch (error) {
            next(error);
        }
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
            const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : 10;
            const search = req.query.search ? String(req.query.search) : undefined;
            const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;
            const lowStock = req.query.lowStock === "true";
            const offset = (page - 1) * limit;

            const { data, total } = await this.listProductsUseCase.execute({
                page,
                limit,
                search,
                categoryId,
                lowStock,
            });

            return res.status(200).json(
                ResponseHttp.pagination("Products retrieved successfully", data, total, limit, offset)
            );
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const product = await this.deleteProductUseCase.execute(id);
            return res.status(200).json(ResponseHttp.success("Product deleted successfully", product));
        } catch (error) {
            next(error);
        }
    };
}
