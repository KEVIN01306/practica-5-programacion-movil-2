import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { Argon2HashProvider } from '../../shared/infrastructure/argon2-hash.provider.js';
import JwtProvider from '../Auth/domain/jwt.provider.js';
import { SendOtpUseCase } from '../Auth/application/send-otp.usecase.js';
import { VerifyOtpUseCase } from '../Auth/application/verify-otp.usecase.js';
import { ResetPasswordWithOtpUseCase } from '../Auth/application/reset-password-with-otp.usecase.js';
import { CreateUserUseCase } from './application/create-user.usecase.js';
import type { EmailProvider, SendEmailResult } from '../../shared/domain/email.provider.js';
import type { OtpProvider, SendOtpResult, VerifyOtpResult } from '../Auth/domain/otp.provider.js';
import { PrismaUsersRepository } from './infrastructure/prisma-users.repository.js';
import { PrismaAuthRespository } from '../Auth/infrastructure/prisma-auth.repository.js';
import { AuditLogService } from '../Audit/application/audit-log.service.js';
import { PrismaAuditRepository } from '../Audit/infrastructure/prisma-audit.repository.js';
import AppError from '../../shared/errors/AppError.js';

// Mock Email Provider
class MockEmailProvider implements EmailProvider {
    public lastSentTo: string | null = null;
    public lastSentSubject: string | null = null;
    public lastSentHtml: string | null = null;

    async sendEmail(options: { to: string; subject: string; htmlContent: string; logoUrl?: string; projectName?: string }): Promise<SendEmailResult> {
        this.lastSentTo = options.to;
        this.lastSentSubject = options.subject;
        this.lastSentHtml = options.htmlContent;
        return {
            success: true,
            message: 'Email enviado con éxito (Mock)',
            messageId: 'mock-msg-' + Date.now(),
        };
    }

    async sendWelcomeCredentialsEmail(to: string, name: string, tempPassword: string, projectName?: string): Promise<SendEmailResult> {
        this.lastSentTo = to;
        this.lastSentSubject = 'Bienvenido a Asyncronix CAD - Credenciales de Acceso';
        this.lastSentHtml = `<p>Usuario: ${to}, Password: ${tempPassword}</p>`;
        return {
            success: true,
            message: 'Email de bienvenida enviado con éxito (Mock)',
            messageId: 'mock-msg-' + Date.now(),
        };
    }
}

// Mock OTP Provider
class MockOtpProvider implements OtpProvider {
    public lastSentEmail: string | null = null;
    public validOtp = '654321';

    async sendOtp(email: string, type: 'PASSWORD_RESET' | 'OTP' = 'OTP'): Promise<SendOtpResult> {
        this.lastSentEmail = email;
        return {
            success: true,
            message: 'Código OTP enviado correctamente (Mock)',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        };
    }

    async verifyOtp(email: string, code: string, type: 'PASSWORD_RESET' | 'OTP' = 'OTP'): Promise<VerifyOtpResult> {
        if (code !== this.validOtp) {
            throw new AppError('Código OTP incorrecto', 'INVALID_OTP', 400);
        }
        return {
            success: true,
            verified: true,
            message: 'Código verificado con éxito (Mock)',
        };
    }
}

async function runTests() {
    console.log('🧪 Starting User Creation, Welcome Email & Mandatory Activation Test Suite...\n');

    const prisma = new PrismaClient();
    const usersRepository = new PrismaUsersRepository(prisma);
    const authRepository = new PrismaAuthRespository(prisma);
    const auditRepository = new PrismaAuditRepository(prisma);
    const auditLogService = new AuditLogService(auditRepository);
    const hashProvider = new Argon2HashProvider();
    const jwtProvider = new JwtProvider();
    const mockEmailProvider = new MockEmailProvider();
    const mockOtpProvider = new MockOtpProvider();

    const createUserUseCase = new CreateUserUseCase(usersRepository, hashProvider, mockEmailProvider, auditLogService);
    const sendOtpUseCase = new SendOtpUseCase(mockOtpProvider, usersRepository, auditLogService);
    const verifyOtpUseCase = new VerifyOtpUseCase(mockOtpProvider, jwtProvider, usersRepository, auditLogService);
    const resetPasswordWithOtpUseCase = new ResetPasswordWithOtpUseCase(
        jwtProvider,
        usersRepository,
        authRepository,
        hashProvider,
        auditLogService
    );

    const testEmail = `activation-test-${Date.now()}@pharmadel.com`;
    let createdUserId = '';

    try {
        // Test 1: Create user with autoGeneratePassword
        console.log('Testing: Create user with autoGeneratePassword...');
        const createdUser = await createUserUseCase.execute({
            email: testEmail,
            firstName: 'Activation',
            lastName: 'Tester',
            roles: ['USER'],
            autoGeneratePassword: true,
        });

        createdUserId = createdUser.id;
        assert.ok(createdUserId, 'User ID should be returned');
        console.log(`✅ [1/8] User created: ${testEmail} (${createdUserId})`);

        // Test 2: Verify isVerify = false on new user
        console.log('Testing: User initial state isVerify === false...');
        const userInDb = await usersRepository.findByIdWithPassword(createdUserId);
        assert.ok(userInDb, 'User must exist in DB');
        assert.equal(userInDb.isVerify, false, 'New user MUST have isVerify = false');
        console.log('✅ [2/8] New user correctly created with isVerify = false');

        // Test 3: Verify welcome email was triggered
        console.log('Testing: Welcome email delivery via EmailProvider...');
        assert.equal(mockEmailProvider.lastSentTo, testEmail, 'Welcome email must be sent to the user email');
        assert.ok(mockEmailProvider.lastSentSubject?.includes('Asyncronix'), 'Email subject matches');
        console.log('✅ [3/8] Welcome email with credentials was dispatched successfully');

        // Test 4: Password was hashed with Argon2 (not plain text)
        console.log('Testing: Password hash format in database...');
        assert.ok(userInDb.passwordHash.startsWith('$argon2'), 'Password must be stored as Argon2 hash');
        console.log('✅ [4/8] Password is cryptographically hashed with Argon2 in DB');

        // Test 5: Step 1 of Activation - Send OTP
        console.log('Testing: Send activation OTP to unverified user...');
        const sendOtpResult = await sendOtpUseCase.execute({ email: testEmail, type: 'OTP' });
        assert.equal(sendOtpResult.success, true);
        assert.equal(mockOtpProvider.lastSentEmail, testEmail);
        console.log('✅ [5/8] Activation OTP sent successfully');

        // Test 6: Step 2 of Activation - Verify OTP and obtain resetToken
        console.log('Testing: Verify OTP code and obtain activation reset token...');
        const verifyOtpResult = await verifyOtpUseCase.execute({
            email: testEmail,
            code: '654321',
            type: 'OTP',
        });
        assert.equal(verifyOtpResult.verified, true);
        assert.ok(verifyOtpResult.resetToken, 'Single-use resetToken must be returned');
        console.log('✅ [6/8] OTP verified and single-use activation resetToken issued');

        // Test 7: Step 3 of Activation - Change password and activate account
        console.log('Testing: Mandatory password change to complete activation...');
        const newPassword = 'BrandNewPassword@2026!';
        await resetPasswordWithOtpUseCase.execute({
            resetToken: verifyOtpResult.resetToken,
            newPassword,
            confirmPassword: newPassword,
        });

        const activatedUser = await usersRepository.findByIdWithPassword(createdUserId);
        assert.ok(activatedUser);
        assert.equal(activatedUser.isVerify, true, 'User MUST have isVerify = true after completing password change');
        console.log('✅ [7/8] Password updated and user isVerify changed to TRUE');

        // Test 8: Verify new password works
        console.log('Testing: Validate that new password authenticates properly...');
        const isNewPasswordValid = await hashProvider.compare(newPassword, activatedUser.passwordHash);
        assert.equal(isNewPasswordValid, true, 'New password must match hash');
        console.log('✅ [8/8] New password authenticated successfully');

        console.log('\n🎉 ALL 8 USER CREATION & ACTIVATION TEST CASES PASSED SUCCESSFULLY!\n');
    } finally {
        if (createdUserId) {
            try {
                await prisma.userRole.deleteMany({ where: { userId: createdUserId } });
                await prisma.auditLog.deleteMany({ where: { userId: createdUserId } });
                await prisma.user.delete({ where: { id: createdUserId } });
                console.log(`🧹 Cleaned up temporary test user ${testEmail}`);
            } catch (cleanupErr) {
                console.error('Error during cleanup:', cleanupErr);
            }
        }
        await prisma.$disconnect();
    }
}

runTests().then(() => {
    process.exit(0);
}).catch((err) => {
    console.error('❌ Test suite failed with error:', err);
    process.exit(1);
});
