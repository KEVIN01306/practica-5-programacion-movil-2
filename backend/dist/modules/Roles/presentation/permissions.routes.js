import { Router } from "express";
import { rolesController } from "../roles.module.js";
import { AuthMiddleware } from "../../../app/middleware/Auth.middleware.js";
const router = Router();
const authMiddleware = new AuthMiddleware();
router.use(authMiddleware.routeProtect);
router.get("/", authMiddleware.checkPermissionSome(["roles:read", "roles:permissions:update"]), rolesController.listPermissions);
export default router;
//# sourceMappingURL=permissions.routes.js.map