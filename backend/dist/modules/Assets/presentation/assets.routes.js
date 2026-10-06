import { Router } from "express";
import { assetsController } from "../assets.module.js";
import { AuthMiddleware } from "../../../app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "../../../app/middleware/Validated.middleware.js";
import { MulterUploadProvider } from "../../../shared/infrastructure/multer.provider.js";
import { AssetIdSchema, CreateAssetBodySchema, UpdateAssetBodySchema, ListAssetsQuerySchema, CopyAssetBodySchema, } from "./validators/assets.schemas.js";
const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();
// Protect all asset routes
router.use(authMiddleware.routeProtect);
router.get("/", authMiddleware.checkPermission("assets:read"), validatedMiddleware.validateQuery(ListAssetsQuerySchema), assetsController.list);
router.get("/:id", authMiddleware.checkPermission("assets:read"), validatedMiddleware.validateParams(AssetIdSchema), assetsController.getById);
// POST: requires a file
router.post("/", authMiddleware.checkPermission("assets:create"), MulterUploadProvider.single("file", true), validatedMiddleware.validateBody(CreateAssetBodySchema), assetsController.create);
// POST /:id/copy: duplicate asset
router.post("/:id/copy", authMiddleware.checkPermission("assets:create"), validatedMiddleware.validateParams(AssetIdSchema), validatedMiddleware.validateBody(CopyAssetBodySchema), assetsController.copy);
// PATCH: file is optional (if provided, replaces physical object)
router.patch("/:id", authMiddleware.checkPermission("assets:update"), validatedMiddleware.validateParams(AssetIdSchema), MulterUploadProvider.single("file", false), validatedMiddleware.validateBody(UpdateAssetBodySchema), assetsController.update);
router.delete("/:id", authMiddleware.checkPermission("assets:delete"), validatedMiddleware.validateParams(AssetIdSchema), assetsController.delete);
export default router;
//# sourceMappingURL=assets.routes.js.map