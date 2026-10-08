import { ResendEmailProvider } from './infrastructure/resend-email.provider.js';
import { MockEmailProvider } from './infrastructure/mock-email.provider.js';
import { SendEmailUseCase } from './application/send-email.usecase.js';
import { EmailController } from './presentation/email.controller.js';
import { auditLogService } from '../Audit/audit.module.js';

// Default Email Provider using Resend
export const emailProvider = new ResendEmailProvider();

// Mock Email Provider for testing & staging environments
export const mockEmailProvider = new MockEmailProvider();

// Use Cases
export const sendEmailUseCase = new SendEmailUseCase(emailProvider, auditLogService);

// Controller
export const emailController = new EmailController(sendEmailUseCase);

// Domain abstractions export
export * from './domain/email.provider.js';
export * from './domain/template-renderer.js';
export * from './application/send-email.usecase.js';
export * from './infrastructure/resend-email.provider.js';
export * from './infrastructure/mock-email.provider.js';
