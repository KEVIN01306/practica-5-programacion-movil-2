import ResponseHttp from "../../../app/http/response.http.js";
import BaseController from "../../../presentation/base.controller.js";
import AppError from "../../../shared/errors/AppError.js";
export class UsersController extends BaseController {
    createUserUseCase;
    updateUserUseCase;
    listUsersUseCase;
    listRolesUseCase;
    activateUserUseCase;
    disableUserUseCase;
    deleteUserUseCase;
    changePasswordUseCase;
    hashProvider;
    constructor(createUserUseCase, updateUserUseCase, listUsersUseCase, listRolesUseCase, activateUserUseCase, disableUserUseCase, deleteUserUseCase, changePasswordUseCase, hashProvider) {
        super();
        this.createUserUseCase = createUserUseCase;
        this.updateUserUseCase = updateUserUseCase;
        this.listUsersUseCase = listUsersUseCase;
        this.listRolesUseCase = listRolesUseCase;
        this.activateUserUseCase = activateUserUseCase;
        this.disableUserUseCase = disableUserUseCase;
        this.deleteUserUseCase = deleteUserUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.hashProvider = hashProvider;
    }
    create = async (req, res, next) => {
        try {
            const data = req.body;
            const auditContext = this.getAuditContext(req, res);
            const user = await this.createUserUseCase.execute(data, auditContext);
            return res.status(201).json(ResponseHttp.success("User created successfully", user));
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
            let passwordHash = undefined;
            if (data.passwordRaw) {
                passwordHash = await this.hashProvider.hash(data.passwordRaw);
            }
            const updateData = {
                ...data,
                passwordHash
            };
            const user = await this.updateUserUseCase.execute(id, updateData, auditContext);
            return res.status(200).json(ResponseHttp.success("User updated successfully", user));
        }
        catch (error) {
            next(error);
        }
    };
    list = async (req, res, next) => {
        try {
            const page = req.query.page ? Math.max(1, parseInt(req.query.page, 10)) : 1;
            const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit, 10)) : 10;
            const q = req.query.q ? String(req.query.q) : undefined;
            const offset = (page - 1) * limit;
            const { data, total } = await this.listUsersUseCase.execute({ page, limit, q });
            return res.status(200).json(ResponseHttp.pagination("Users fetched successfully", data, total, limit, offset));
        }
        catch (error) {
            next(error);
        }
    };
    listRoles = async (req, res, next) => {
        try {
            const roles = await this.listRolesUseCase.execute();
            return res.status(200).json(ResponseHttp.success("Roles fetched successfully", roles));
        }
        catch (error) {
            next(error);
        }
    };
    activate = async (req, res, next) => {
        try {
            const id = req.params.id;
            const auditContext = this.getAuditContext(req, res);
            const user = await this.activateUserUseCase.execute(id, auditContext);
            return res.status(200).json(ResponseHttp.success("User reactivated successfully", user));
        }
        catch (error) {
            next(error);
        }
    };
    disable = async (req, res, next) => {
        try {
            const id = req.params.id;
            const auditContext = this.getAuditContext(req, res);
            const user = await this.disableUserUseCase.execute(id, auditContext);
            return res.status(200).json(ResponseHttp.success("User disabled successfully", user));
        }
        catch (error) {
            next(error);
        }
    };
    changePassword = async (req, res, next) => {
        try {
            const userCtx = req.user || res.locals.user;
            if (!userCtx?.id) {
                throw new AppError("Unauthorized", "UNAUTHORIZED", 401);
            }
            const auditContext = this.getAuditContext(req, res);
            await this.changePasswordUseCase.execute(userCtx.id, req.body, auditContext);
            return res.status(200).json(ResponseHttp.success("Password changed successfully", null));
        }
        catch (error) {
            next(error);
        }
    };
    delete = async (req, res, next) => {
        try {
            const id = req.params.id;
            const auditContext = this.getAuditContext(req, res);
            const user = await this.deleteUserUseCase.execute(id, auditContext);
            return res.status(200).json(ResponseHttp.success("User deleted successfully", user));
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=users.controller.js.map