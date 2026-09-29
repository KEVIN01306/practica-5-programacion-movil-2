import type { Request, Response, NextFunction } from "express";
import ResponseHttp from "@app/http/response.http.js";
import BaseController from "@presentation/base.controller.js";
import type { CreateRoleUseCase } from "../application/create-role.usecase.js";
import type { ListRolesUseCase } from "../application/list-roles.usecase.js";
import type { GetRoleUseCase } from "../application/get-role.usecase.js";
import type { UpdateRoleUseCase } from "../application/update-role.usecase.js";
import type { DeleteRoleUseCase } from "../application/delete-role.usecase.js";
import type { ListPermissionsUseCase } from "../application/list-permissions.usecase.js";
import type { GetRolePermissionsUseCase } from "../application/get-role-permissions.usecase.js";
import type { UpdateRolePermissionsUseCase } from "../application/update-role-permissions.usecase.js";
import type { GetPermissionsMatrixUseCase } from "../application/get-permissions-matrix.usecase.js";
import type { Role } from "../domain/role.entity.js";

export class RolesController extends BaseController {
    constructor(
        private readonly createRoleUseCase: CreateRoleUseCase,
        private readonly listRolesUseCase: ListRolesUseCase,
        private readonly getRoleUseCase: GetRoleUseCase,
        private readonly updateRoleUseCase: UpdateRoleUseCase,
        private readonly deleteRoleUseCase: DeleteRoleUseCase,
        private readonly listPermissionsUseCase: ListPermissionsUseCase,
        private readonly getRolePermissionsUseCase: GetRolePermissionsUseCase,
        private readonly updateRolePermissionsUseCase: UpdateRolePermissionsUseCase,
        private readonly getPermissionsMatrixUseCase: GetPermissionsMatrixUseCase
    ) {
        super();
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const auditContext = this.getAuditContext(req, res);
            const role = await this.createRoleUseCase.execute(data, auditContext);
            return res.status(201).json(ResponseHttp.success("Role created successfully", role));
        } catch (error) {
            next(error);
        }
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const all = req.query.all === "true";
            if (all) {
                const roles = await this.listRolesUseCase.execute({ all: true }) as Role[];
                return res.status(200).json(ResponseHttp.success("Roles fetched successfully", roles));
            }

            const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
            const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : 10;
            const q = req.query.q ? String(req.query.q) : undefined;
            const offset = (page - 1) * limit;

            const result = await this.listRolesUseCase.execute({ page, limit, q }) as { data: Role[]; total: number };
            return res.status(200).json(ResponseHttp.pagination("Roles fetched successfully", result.data, result.total, limit, offset));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const role = await this.getRoleUseCase.execute(id);
            return res.status(200).json(ResponseHttp.success("Role fetched successfully", role));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const data = req.body;
            const auditContext = this.getAuditContext(req, res);
            const role = await this.updateRoleUseCase.execute(id, data, auditContext);
            return res.status(200).json(ResponseHttp.success("Role updated successfully", role));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const auditContext = this.getAuditContext(req, res);
            await this.deleteRoleUseCase.execute(id, auditContext);
            return res.status(200).json(ResponseHttp.success("Role deleted successfully", null));
        } catch (error) {
            next(error);
        }
    };

    listPermissions = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const permissions = await this.listPermissionsUseCase.execute();
            return res.status(200).json(ResponseHttp.success("Permissions fetched successfully", permissions));
        } catch (error) {
            next(error);
        }
    };

    getRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const roleId = req.params.roleId as string;
            const permissions = await this.getRolePermissionsUseCase.execute(roleId);
            return res.status(200).json(ResponseHttp.success("Role permissions fetched successfully", permissions));
        } catch (error) {
            next(error);
        }
    };

    updateRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const roleId = req.params.roleId as string;
            const { permissionIds } = req.body;
            const auditContext = this.getAuditContext(req, res);
            const permissions = await this.updateRolePermissionsUseCase.execute(roleId, permissionIds, auditContext);
            return res.status(200).json(ResponseHttp.success("Role permissions updated successfully", permissions));
        } catch (error) {
            next(error);
        }
    };

    getMatrix = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const matrix = await this.getPermissionsMatrixUseCase.execute();
            return res.status(200).json(ResponseHttp.success("Permissions matrix fetched successfully", matrix));
        } catch (error) {
            next(error);
        }
    };
}
