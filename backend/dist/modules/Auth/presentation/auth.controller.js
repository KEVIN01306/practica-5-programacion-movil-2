import ResponseHttp from "../../../app/http/response.http.js";
import AppError from "../../../shared/errors/AppError.js";
import BaseController from "../../../presentation/base.controller.js";
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
};
const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
export class AuthController extends BaseController {
    loginUseCase;
    refreshTokenUseCase;
    getProfileUseCase;
    logoutUseCase;
    sendOtpUseCase;
    verifyOtpUseCase;
    resetPasswordWithOtpUseCase;
    constructor(loginUseCase, refreshTokenUseCase, getProfileUseCase, logoutUseCase, sendOtpUseCase, verifyOtpUseCase, resetPasswordWithOtpUseCase) {
        super();
        this.loginUseCase = loginUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.getProfileUseCase = getProfileUseCase;
        this.logoutUseCase = logoutUseCase;
        this.sendOtpUseCase = sendOtpUseCase;
        this.verifyOtpUseCase = verifyOtpUseCase;
        this.resetPasswordWithOtpUseCase = resetPasswordWithOtpUseCase;
    }
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const auditContext = this.getAuditContext(req, res);
            const { accessToken, refreshToken, user } = await this.loginUseCase.execute({ email, password }, auditContext);
            res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
            return res.status(200).json(ResponseHttp.success("Login successful", { accessToken, user }));
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (req, res, next) => {
        try {
            const userCtx = res.locals.user;
            const auditContext = this.getAuditContext(req, res);
            if (userCtx?.id) {
                await this.logoutUseCase.execute(userCtx.id, auditContext);
            }
            res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'strict',
                path: '/'
            });
            return res.status(200).json(ResponseHttp.success("Logout successful", null));
        }
        catch (error) {
            next(error);
        }
    };
    refresh = async (req, res, next) => {
        try {
            const tokenReceived = req.cookies.refreshToken;
            if (!tokenReceived) {
                throw new AppError("You must log in again", "MISSING_COOKIE", 401);
            }
            const { accessToken, refreshToken, user } = await this.refreshTokenUseCase.execute(tokenReceived);
            res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
            return res.status(200).json(ResponseHttp.success("Token renewed", { accessToken, user }));
        }
        catch (error) {
            next(error);
        }
    };
    getProfile = async (req, res, next) => {
        try {
            const userCtx = res.locals.user;
            if (!userCtx) {
                throw new AppError("Unauthenticated user", "UNAUTHORIZED", 401);
            }
            const profile = await this.getProfileUseCase.execute(userCtx.id);
            return res.status(200).json(ResponseHttp.success("Profile fetched", profile));
        }
        catch (error) {
            next(error);
        }
    };
    sendOtp = async (req, res, next) => {
        try {
            if (!this.sendOtpUseCase) {
                throw new AppError("Send OTP service not configured", "INTERNAL_SERVER_ERROR", 500);
            }
            const auditContext = this.getAuditContext(req, res);
            const result = await this.sendOtpUseCase.execute(req.body, auditContext);
            return res.status(200).json(ResponseHttp.success(result.message, { expiresAt: result.expiresAt }));
        }
        catch (error) {
            next(error);
        }
    };
    verifyOtp = async (req, res, next) => {
        try {
            if (!this.verifyOtpUseCase) {
                throw new AppError("Verify OTP service not configured", "INTERNAL_SERVER_ERROR", 500);
            }
            const auditContext = this.getAuditContext(req, res);
            const result = await this.verifyOtpUseCase.execute(req.body, auditContext);
            return res.status(200).json(ResponseHttp.success(result.message, {
                verified: result.verified,
                resetToken: result.resetToken,
            }));
        }
        catch (error) {
            next(error);
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            if (!this.resetPasswordWithOtpUseCase) {
                throw new AppError("Reset password service not configured", "INTERNAL_SERVER_ERROR", 500);
            }
            const auditContext = this.getAuditContext(req, res);
            await this.resetPasswordWithOtpUseCase.execute(req.body, auditContext);
            return res.status(200).json(ResponseHttp.success("Contraseña actualizada exitosamente", null));
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=auth.controller.js.map