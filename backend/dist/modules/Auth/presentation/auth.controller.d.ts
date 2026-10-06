import type { LoginUseCase } from "../application/login.usecase.js";
import type { Request, Response, NextFunction } from "express";
import type { RefreshTokenUseCase } from "../application/refresh-token.usecase.js";
import type { GetProfileUseCase } from "../application/get-profile.usecase.js";
import type { LogoutUseCase } from "../application/logout.usecase.js";
import type { SendOtpUseCase } from "../application/send-otp.usecase.js";
import type { VerifyOtpUseCase } from "../application/verify-otp.usecase.js";
import type { ResetPasswordWithOtpUseCase } from "../application/reset-password-with-otp.usecase.js";
import BaseController from "../../../presentation/base.controller.js";
export declare class AuthController extends BaseController {
    private readonly loginUseCase;
    private readonly refreshTokenUseCase;
    private readonly getProfileUseCase;
    private readonly logoutUseCase;
    private readonly sendOtpUseCase?;
    private readonly verifyOtpUseCase?;
    private readonly resetPasswordWithOtpUseCase?;
    constructor(loginUseCase: LoginUseCase, refreshTokenUseCase: RefreshTokenUseCase, getProfileUseCase: GetProfileUseCase, logoutUseCase: LogoutUseCase, sendOtpUseCase?: SendOtpUseCase | undefined, verifyOtpUseCase?: VerifyOtpUseCase | undefined, resetPasswordWithOtpUseCase?: ResetPasswordWithOtpUseCase | undefined);
    login: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    logout: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    refresh: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getProfile: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    sendOtp: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    verifyOtp: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=auth.controller.d.ts.map