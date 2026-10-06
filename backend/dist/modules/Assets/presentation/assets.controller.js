import ResponseHttp from "../../../app/http/response.http.js";
import BaseController from "../../../presentation/base.controller.js";
export class AssetsController extends BaseController {
    createAssetUseCase;
    listAssetsUseCase;
    getAssetUseCase;
    updateAssetUseCase;
    deleteAssetUseCase;
    copyAssetUseCase;
    constructor(createAssetUseCase, listAssetsUseCase, getAssetUseCase, updateAssetUseCase, deleteAssetUseCase, copyAssetUseCase) {
        super();
        this.createAssetUseCase = createAssetUseCase;
        this.listAssetsUseCase = listAssetsUseCase;
        this.getAssetUseCase = getAssetUseCase;
        this.updateAssetUseCase = updateAssetUseCase;
        this.deleteAssetUseCase = deleteAssetUseCase;
        this.copyAssetUseCase = copyAssetUseCase;
    }
    create = async (req, res, next) => {
        try {
            const auditContext = this.getAuditContext(req, res);
            const file = req.file;
            let folderId = null;
            if (req.body.folderId && req.body.folderId !== "null" && req.body.folderId !== "") {
                folderId = req.body.folderId;
            }
            const asset = await this.createAssetUseCase.execute({
                name: req.body.name,
                description: req.body.description,
                sku: req.body.sku,
                brandId: req.body.brandId,
                folderId,
                file: {
                    buffer: file.buffer,
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                },
            }, auditContext);
            return res.status(201).json(ResponseHttp.success("Asset created successfully", asset));
        }
        catch (error) {
            next(error);
        }
    };
    list = async (req, res, next) => {
        try {
            const page = req.query.page ? Math.max(1, parseInt(req.query.page, 10)) : 1;
            const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit, 10)) : 10;
            const offset = (page - 1) * limit;
            const brandId = req.query.brandId ? String(req.query.brandId) : undefined;
            const rawFolderId = req.query.folderId !== undefined ? String(req.query.folderId) : undefined;
            const folderId = rawFolderId === "null" ? null : rawFolderId || undefined;
            const type = req.query.type;
            const sku = req.query.sku ? String(req.query.sku) : undefined;
            const q = req.query.q ? String(req.query.q) : undefined;
            const result = await this.listAssetsUseCase.execute({
                page,
                limit,
                filters: {
                    brandId,
                    folderId,
                    type,
                    sku,
                    q,
                },
            });
            return res
                .status(200)
                .json(ResponseHttp.pagination("Assets fetched successfully", result.data, result.total, limit, offset));
        }
        catch (error) {
            next(error);
        }
    };
    getById = async (req, res, next) => {
        try {
            const id = req.params.id;
            const asset = await this.getAssetUseCase.execute(id);
            return res.status(200).json(ResponseHttp.success("Asset fetched successfully", asset));
        }
        catch (error) {
            next(error);
        }
    };
    update = async (req, res, next) => {
        try {
            const id = req.params.id;
            const auditContext = this.getAuditContext(req, res);
            const file = req.file;
            let folderId = undefined;
            if (req.body.folderId !== undefined) {
                folderId =
                    req.body.folderId === "null" || req.body.folderId === "" || req.body.folderId === null
                        ? null
                        : req.body.folderId;
            }
            const asset = await this.updateAssetUseCase.execute(id, {
                name: req.body.name,
                description: req.body.description,
                sku: req.body.sku,
                brandId: req.body.brandId,
                folderId,
                file: file
                    ? {
                        buffer: file.buffer,
                        originalname: file.originalname,
                        mimetype: file.mimetype,
                        size: file.size,
                    }
                    : null,
            }, auditContext);
            return res.status(200).json(ResponseHttp.success("Asset updated successfully", asset));
        }
        catch (error) {
            next(error);
        }
    };
    copy = async (req, res, next) => {
        try {
            const id = req.params.id;
            const auditContext = this.getAuditContext(req, res);
            let targetFolderId = null;
            if (req.body.targetFolderId && req.body.targetFolderId !== "null" && req.body.targetFolderId !== "") {
                targetFolderId = req.body.targetFolderId;
            }
            const asset = await this.copyAssetUseCase.execute(id, {
                targetBrandId: req.body.targetBrandId,
                targetFolderId,
            }, auditContext);
            return res.status(201).json(ResponseHttp.success("Asset copied successfully", asset));
        }
        catch (error) {
            next(error);
        }
    };
    delete = async (req, res, next) => {
        try {
            const id = req.params.id;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteAssetUseCase.execute(id, auditContext);
            return res.status(200).json(ResponseHttp.success("Asset deleted successfully", null));
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=assets.controller.js.map