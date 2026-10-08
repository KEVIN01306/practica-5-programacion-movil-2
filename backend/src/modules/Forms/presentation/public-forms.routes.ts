import { Router } from "express";
import { publicFormsController } from "../forms.module.js";
import { ApiKeyMiddleware } from "../../../app/middleware/ApiKey.middleware.js";
import { ValidatedMiddleware } from "../../../app/middleware/Validated.middleware.js";
import { PublicFormSubmitParamsSchema } from "./validators/public-forms.schemas.js";

const router = Router();
const apiKeyMiddleware = new ApiKeyMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Public submission endpoint: Authenticated strictly via Website API Key header (x-api-key)
router.post(
    "/:slug/submit",
    apiKeyMiddleware.requireApiKey,
    validatedMiddleware.validateParams(PublicFormSubmitParamsSchema),
    publicFormsController.submit
);

export default router;
