import { Router } from "express";
import { headlessContentController } from "../content-types.module.js";
import { ApiKeyMiddleware } from "../../../app/middleware/ApiKey.middleware.js";

const router = Router();
const apiKeyMiddleware = new ApiKeyMiddleware();

// All headless content endpoints require valid website API key
router.use(apiKeyMiddleware.requireApiKey);

// List all available content types for this website
router.get("/types", headlessContentController.listAvailableTypes);

// Get content by resource slug (e.g. GET /content/products or GET /content/blog-posts)
router.get("/:slug", headlessContentController.getContentBySlug);

// Get single content item by ID
router.get("/:slug/:id", headlessContentController.getItemById);

export default router;
