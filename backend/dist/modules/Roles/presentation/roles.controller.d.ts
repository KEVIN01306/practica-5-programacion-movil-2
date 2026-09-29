import type { Request, Response, NextFunction } from "express";
import BaseController from "../../../presentation/base.controller.js";
import type { CreateRoleUseCase } from "../application/create-role.usecase.js";
import type { ListRolesUseCase } from "../application/list-roles.usecase.js";
import type { GetRoleUseCase } from "../application/get-role.usecase.js";
import type { UpdateRoleUseCase } from "../application/update-role.usecase.js";
import type { DeleteRoleUseCase } from "../application/delete-role.usecase.js";
import type { ListPermissionsUseCase } from "../application/list-permissions.usecase.js";
import type { GetRolePermissionsUseCase } from "../application/get-role-permissions.usecase.js";
import type { UpdateRolePermissionsUseCase } from "../application/update-role-permissions.usecase.js";
import type { GetPermissionsMatrixUseCase } from "../application/get-permissions-matrix.usecase.js";
export declare class RolesController extends BaseController {
    private readonly createRoleUseCase;
    private readonly listRolesUseCase;
    private readonly getRoleUseCase;
    private readonly updateRoleUseCase;
    private readonly deleteRoleUseCase;
    private readonly listPermissionsUseCase;
    private readonly getRolePermissionsUseCase;
    private readonly updateRolePermissionsUseCase;
    private readonly getPermissionsMatrixUseCase;
    constructor(createRoleUseCase: CreateRoleUseCase, listRolesUseCase: ListRolesUseCase, getRoleUseCase: GetRoleUseCase, updateRoleUseCase: UpdateRoleUseCase, deleteRoleUseCase: DeleteRoleUseCase, listPermissionsUseCase: ListPermissionsUseCase, getRolePermissionsUseCase: GetRolePermissionsUseCase, updateRolePermissionsUseCase: UpdateRolePermissionsUseCase, getPermissionsMatrixUseCase: GetPermissionsMatrixUseCase);
    create: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    list: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    listPermissions: (_req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getRolePermissions: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    updateRolePermissions: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getMatrix: (_req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=roles.controller.d.ts.map