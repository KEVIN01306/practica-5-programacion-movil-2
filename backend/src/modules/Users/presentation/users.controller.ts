import type { Request, Response, NextFunction } from "express";
import ResponseHttp from "@app/http/response.http.js";
import BaseController from "@presentation/base.controller.js";
import type { CreateUserUseCase } from "../application/create-user.usecase.js";
import type { UpdateUserUseCase } from "../application/update-user.usecase.js";
import type { ListUsersUseCase } from "../application/list-users.usecase.js";
import type { ListRolesUseCase } from "../application/list-roles.usecase.js";
import type { ActivateUserUseCase } from "../application/activate-user.usecase.js";
import type { DisableUserUseCase } from "../application/disable-user.usecase.js";
import type { DeleteUserUseCase } from "../application/delete-user.usecase.js";
import type { ChangePasswordUseCase } from "../application/change-password.usecase.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import AppError from "@shared/errors/AppError.js";

export class UsersController extends BaseController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly listUsersUseCase: ListUsersUseCase,
        private readonly listRolesUseCase: ListRolesUseCase,
        private readonly activateUserUseCase: ActivateUserUseCase,
        private readonly disableUserUseCase: DisableUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly changePasswordUseCase: ChangePasswordUseCase,
        private readonly hashProvider: HashProvider
    ) {
        super();
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const user = await this.createUserUseCase.execute(data);
            return res.status(201).json(ResponseHttp.success("User created successfully", user));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const data = req.body;
            
            let passwordHash = undefined;
            if (data.passwordRaw) {
                passwordHash = await this.hashProvider.hash(data.passwordRaw);
            }

            const updateData = {
                ...data,
                passwordHash
            };

            const user = await this.updateUserUseCase.execute(id, updateData);
            return res.status(200).json(ResponseHttp.success("User updated successfully", user));
        } catch (error) {
            next(error);
        }
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
            const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : 10;
            const q = req.query.q ? String(req.query.q) : undefined;
            const offset = (page - 1) * limit;

            const { data, total } = await this.listUsersUseCase.execute({ page, limit, q });
            return res.status(200).json(ResponseHttp.pagination("Users fetched successfully", data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    };

    listRoles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const roles = await this.listRolesUseCase.execute();
            return res.status(200).json(ResponseHttp.success("Roles fetched successfully", roles));
        } catch (error) {
            next(error);
        }
    };

    activate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const user = await this.activateUserUseCase.execute(id);
            return res.status(200).json(ResponseHttp.success("User reactivated successfully", user));
        } catch (error) {
            next(error);
        }
    };

    disable = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const user = await this.disableUserUseCase.execute(id);
            return res.status(200).json(ResponseHttp.success("User disabled successfully", user));
        } catch (error) {
            next(error);
        }
    };

    changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userCtx = (req as any).user || res.locals.user;
            if (!userCtx?.id) {
                throw new AppError("Unauthorized", "UNAUTHORIZED", 401);
            }
            await this.changePasswordUseCase.execute(userCtx.id, req.body);
            return res.status(200).json(ResponseHttp.success("Password changed successfully", null));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const user = await this.deleteUserUseCase.execute(id);
            return res.status(200).json(ResponseHttp.success("User deleted successfully", user));
        } catch (error) {
            next(error);
        }
    };
}
