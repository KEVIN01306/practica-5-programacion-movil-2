import { Router } from "express";
import HeadlessContentRoutes from "../modules/ContentTypes/presentation/headless-content.routes.js";
import PublicFormsRoutes from "../modules/Forms/presentation/public-forms.routes.js";
import { ErrorMiddleware } from "../app/middleware/Error.middleware.js";

const v1Router = Router();

// ============================================================================
// Consumables / Public Headless Delivery APIs (Version 1)
// Authenticated via x-api-key or query param ?apiKey=...
// ============================================================================
v1Router.use("/content", HeadlessContentRoutes);
v1Router.use("/forms", PublicFormsRoutes);

v1Router.use(ErrorMiddleware);

export default v1Router;
