import type { Request, Response, NextFunction } from "express";
import BaseController from "../../../presentation/base.controller.js";
import type { CreateUserUseCase } from "../application/create-user.usecase.js";
import type { UpdateUserUseCase } from "../application/update-user.usecase.js";
import type { ListUsersUseCase } from "../application/list-users.usecase.js";
import type { ListRolesUseCase } from "../application/list-roles.usecase.js";
import type { ActivateUserUseCase } from "../application/activate-user.usecase.js";
import type { DisableUserUseCase } from "../application/disable-user.usecase.js";
import type { DeleteUserUseCase } from "../application/delete-user.usecase.js";
import type { ChangePasswordUseCase } from "../application/change-password.usecase.js";
import type { HashProvider } from "../../../shared/domain/hash.provider.js";
export declare class UsersController extends BaseController {
    private readonly createUserUseCase;
    private readonly updateUserUseCase;
    private readonly listUsersUseCase;
    private readonly listRolesUseCase;
    private readonly activateUserUseCase;
    private readonly disableUserUseCase;
    private readonly deleteUserUseCase;
    private readonly changePasswordUseCase;
    private readonly hashProvider;
    constructor(createUserUseCase: CreateUserUseCase, updateUserUseCase: UpdateUserUseCase, listUsersUseCase: ListUsersUseCase, listRolesUseCase: ListRolesUseCase, activateUserUseCase: ActivateUserUseCase, disableUserUseCase: DisableUserUseCase, deleteUserUseCase: DeleteUserUseCase, changePasswordUseCase: ChangePasswordUseCase, hashProvider: HashProvider);
    create: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    list: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    listRoles: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    activate: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    disable: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    changePassword: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=users.controller.d.ts.map