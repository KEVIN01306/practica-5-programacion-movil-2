import ResponseHttp from "@app/http/response.http.js";
import type { LoginUseCase } from "../application/login.usecase.js";
import type { Request, Response, NextFunction } from "express";
import AppError from "@shared/errors/AppError.js";
import type { RefreshTokenUseCase } from "../application/refresh-token.usecase.js";
import type { GetProfileUseCase } from "../application/get-profile.usecase.js";
import type { LogoutUseCase } from "../application/logout.usecase.js";
import BaseController from "@presentation/base.controller.js";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
};

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

export class AuthController extends BaseController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        private readonly getProfileUseCase: GetProfileUseCase,
        private readonly logoutUseCase: LogoutUseCase
    ) {
        super();
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            const { accessToken, refreshToken, user } = await this.loginUseCase.execute({ email, password });

            res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

            return res.status(200).json(
                ResponseHttp.success("Login successful", { accessToken, user })
            );
        } catch (error) {
            next(error);
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.id;

            await this.logoutUseCase.execute(userId);

            res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, COOKIE_OPTIONS);

            return res.status(200).json(
                ResponseHttp.success("Logout successful", null)
            );
        } catch (error) {
            next(error);
        }
    };

    refresh = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

            if (!token) {
                throw new AppError("Token not found", "UNAUTHORIZED", 401);
            }

            const { accessToken, refreshToken, user } = await this.refreshTokenUseCase.execute(token);

            res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

            return res.status(200).json(
                ResponseHttp.success("Token refreshed", { accessToken, user })
            );
        } catch (error) {
            next(error);
        }
    };

    getProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.id;

            const user = await this.getProfileUseCase.execute(userId);

            return res.status(200).json(
                ResponseHttp.success("User profile", user)
            );
        } catch (error) {
            next(error);
        }
    };
}
