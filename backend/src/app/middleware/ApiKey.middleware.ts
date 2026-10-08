import type { Request, Response, NextFunction } from "express";
import { websitesRepository } from "../../modules/Websites/websites.module.js";
import AppError from "../../shared/errors/AppError.js";

declare global {
    namespace Express {
        interface Request {
            website?: {
                id: string;
                name: string;
                domain: string;
                apiKey: string;
                isActive: boolean;
            };
        }
    }
}

export class ApiKeyMiddleware {
    async requireApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Extract API key from header (x-api-key or Authorization Bearer) or query param
            let apiKey = (req.headers["x-api-key"] as string) || (req.query.apiKey as string);

            if (!apiKey && req.headers.authorization) {
                const authHeader = req.headers.authorization;
                if (authHeader.startsWith("Bearer ")) {
                    apiKey = authHeader.substring(7).trim();
                } else {
                    apiKey = authHeader.trim();
                }
            }

            if (!apiKey) {
                throw new AppError(
                    "API Key is missing. Provide 'x-api-key' header or 'apiKey' query parameter.",
                    "API_KEY_REQUIRED",
                    401
                );
            }

            const website = await websitesRepository.findByApiKey(apiKey);
            if (!website) {
                throw new AppError(
                    "Invalid API Key provided",
                    "INVALID_API_KEY",
                    401
                );
            }

            if (!website.isActive) {
                throw new AppError(
                    "This website is deactivated and cannot serve content",
                    "WEBSITE_INACTIVE",
                    403
                );
            }

            req.website = {
                id: website.id,
                name: website.name,
                domain: website.domain,
                apiKey: website.apiKey,
                isActive: website.isActive,
            };

            next();
        } catch (error) {
            next(error);
        }
    }
}
