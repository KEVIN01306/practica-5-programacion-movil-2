import { Router } from 'express';
import { emailController } from '../email.module.js';
import { AuthMiddleware } from '../../../app/middleware/Auth.middleware.js';
import { ValidatedMiddleware } from '../../../app/middleware/Validated.middleware.js';
import { SendEmailSchema } from './validators/email.schemas.js';

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Requires authentication
router.use(authMiddleware.routeProtect);

// Send generic email
router.post(
    '/send',
    authMiddleware.checkPermission('emails:send'),
    validatedMiddleware.validateBody(SendEmailSchema),
    emailController.sendEmail
);

export default router;
