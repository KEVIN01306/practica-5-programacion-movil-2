import ResponseHttp from "../../../app/http/response.http.js";
import BaseController from "../../../presentation/base.controller.js";
export class RolesController extends BaseController {
    createRoleUseCase;
    listRolesUseCase;
    getRoleUseCase;
    updateRoleUseCase;
    deleteRoleUseCase;
    listPermissionsUseCase;
    getRolePermissionsUseCase;
    updateRolePermissionsUseCase;
    getPermissionsMatrixUseCase;
    constructor(createRoleUseCase, listRolesUseCase, getRoleUseCase, updateRoleUseCase, deleteRoleUseCase, listPermissionsUseCase, getRolePermissionsUseCase, updateRolePermissionsUseCase, getPermissionsMatrixUseCase) {
        super();
        this.createRoleUseCase = createRoleUseCase;
        this.listRolesUseCase = listRolesUseCase;
        this.getRoleUseCase = getRoleUseCase;
        this.updateRoleUseCase = updateRoleUseCase;
        this.deleteRoleUseCase = deleteRoleUseCase;
        this.listPermissionsUseCase = listPermissionsUseCase;
        this.getRolePermissionsUseCase = getRolePermissionsUseCase;
        this.updateRolePermissionsUseCase = updateRolePermissionsUseCase;
        this.getPermissionsMatrixUseCase = getPermissionsMatrixUseCase;
    }
    create = async (req, res, next) => {
        try {
            const data = req.body;
            const auditContext = this.getAuditContext(req, res);
            const role = await this.createRoleUseCase.execute(data, auditContext);
            return res.status(201).json(ResponseHttp.success("Role created successfully", role));
        }
        catch (error) {
            next(error);
        }
    };
    list = async (req, res, next) => {
        try {
            const all = req.query.all === "true";
            if (all) {
                const roles = await this.listRolesUseCase.execute({ all: true });
                return res.status(200).json(ResponseHttp.success("Roles fetched successfully", roles));
            }
            const page = req.query.page ? Math.max(1, parseInt(req.query.page, 10)) : 1;
            const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit, 10)) : 10;
            const q = req.query.q ? String(req.query.q) : undefined;
            const offset = (page - 1) * limit;
            const result = await this.listRolesUseCase.execute({ page, limit, q });
            return res.status(200).json(ResponseHttp.pagination("Roles fetched successfully", result.data, result.total, limit, offset));
        }
        catch (error) {
            next(error);
        }
    };
    getById = async (req, res, next) => {
        try {
            const id = req.params.id;
            const role = await this.getRoleUseCase.execute(id);
            return res.status(200).json(ResponseHttp.success("Role fetched successfully", role));
        }
        catch (error) {
            next(error);
        }
    };
    update = async (req, res, next) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const auditContext = this.getAuditContext(req, res);
            const role = await this.updateRoleUseCase.execute(id, data, auditContext);
            return res.status(200).json(ResponseHttp.success("Role updated successfully", role));
        }
        catch (error) {
            next(error);
        }
    };
    delete = async (req, res, next) => {
        try {
            const id = req.params.id;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteRoleUseCase.execute(id, auditContext);
            return res.status(200).json(ResponseHttp.success("Role deleted successfully", null));
        }
        catch (error) {
            next(error);
        }
    };
    listPermissions = async (_req, res, next) => {
        try {
            const permissions = await this.listPermissionsUseCase.execute();
            return res.status(200).json(ResponseHttp.success("Permissions fetched successfully", permissions));
        }
        catch (error) {
            next(error);
        }
    };
    getRolePermissions = async (req, res, next) => {
        try {
            const roleId = req.params.roleId;
            const permissions = await this.getRolePermissionsUseCase.execute(roleId);
            return res.status(200).json(ResponseHttp.success("Role permissions fetched successfully", permissions));
        }
        catch (error) {
            next(error);
        }
    };
    updateRolePermissions = async (req, res, next) => {
        try {
            const roleId = req.params.roleId;
            const { permissionIds } = req.body;
            const auditContext = this.getAuditContext(req, res);
            const permissions = await this.updateRolePermissionsUseCase.execute(roleId, permissionIds, auditContext);
            return res.status(200).json(ResponseHttp.success("Role permissions updated successfully", permissions));
        }
        catch (error) {
            next(error);
        }
    };
    getMatrix = async (_req, res, next) => {
        try {
            const matrix = await this.getPermissionsMatrixUseCase.execute();
            return res.status(200).json(ResponseHttp.success("Permissions matrix fetched successfully", matrix));
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=roles.controller.js.map