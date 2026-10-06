import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { Argon2HashProvider } from '../../shared/infrastructure/argon2-hash.provider.js';
import JwtProvider from './domain/jwt.provider.js';
import { SendOtpUseCase } from './application/send-otp.usecase.js';
import { VerifyOtpUseCase } from './application/verify-otp.usecase.js';
import { ResetPasswordWithOtpUseCase } from './application/reset-password-with-otp.usecase.js';
import type { OtpProvider, SendOtpResult, VerifyOtpResult } from './domain/otp.provider.js';
import { PrismaUsersRepository } from '../Users/infrastructure/prisma-users.repository.js';
import { PrismaAuthRespository } from './infrastructure/prisma-auth.repository.js';
import { AuditLogService } from '../Audit/application/audit-log.service.js';
import { PrismaAuditRepository } from '../Audit/infrastructure/prisma-audit.repository.js';
import AppError from '../../shared/errors/AppError.js';

// Mock OTP Provider for unit testing without network/rate-limit side-effects
class MockOtpProvider implements OtpProvider {
    public lastSentEmail: string | null = null;
    public lastSentType: string | null = null;
    public validOtp = '123456';
    public shouldFailVerify = false;

    async sendOtp(email: string, type: 'PASSWORD_RESET' | 'OTP' = 'PASSWORD_RESET'): Promise<SendOtpResult> {
        this.lastSentEmail = email;
        this.lastSentType = type;
        return {
            success: true,
            message: 'Código OTP enviado correctamente (Mock)',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        };
    }

    async verifyOtp(email: string, code: string, type: 'PASSWORD_RESET' | 'OTP' = 'PASSWORD_RESET'): Promise<VerifyOtpResult> {
        if (this.shouldFailVerify || code !== this.validOtp) {
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
    console.log('🧪 Starting Auth & Password Reset with OTP automated test suite...\n');

    const prisma = new PrismaClient();
    const usersRepository = new PrismaUsersRepository(prisma);
    const authRepository = new PrismaAuthRespository(prisma);
    const auditRepository = new PrismaAuditRepository(prisma);
    const auditLogService = new AuditLogService(auditRepository);
    const hashProvider = new Argon2HashProvider();
    const jwtProvider = new JwtProvider();
    const mockOtpProvider = new MockOtpProvider();

    const sendOtpUseCase = new SendOtpUseCase(mockOtpProvider, usersRepository, auditLogService);
    const verifyOtpUseCase = new VerifyOtpUseCase(mockOtpProvider, jwtProvider, usersRepository, auditLogService);
    const resetPasswordWithOtpUseCase = new ResetPasswordWithOtpUseCase(
        jwtProvider,
        usersRepository,
        authRepository,
        hashProvider,
        auditLogService
    );

    // Create a temporary test user
    const testEmail = `test-otp-${Date.now()}@pharmadel.com`;
    const initialPassword = 'InitialPassword123!';
    const initialHash = await hashProvider.hash(initialPassword);

    const testUser = await usersRepository.create({
        email: testEmail,
        passwordHash: initialHash,
        firstName: 'Test',
        lastName: 'OTP User',
        roles: ['USER'],
    });

    console.log(`✅ [1/9] Created test user: ${testEmail} (${testUser.id})`);

    try {
        // Test 1: Send OTP to non-existent user should fail
        console.log('Testing: Send OTP to non-existent user...');
        await assert.rejects(
            async () => {
                await sendOtpUseCase.execute({ email: 'nonexistent-user@pharmadel.com' });
            },
            (err: any) => {
                assert.equal(err.code, 'USER_NOT_FOUND');
                return true;
            }
        );
        console.log('✅ [2/9] Non-existent user rejected as expected.');

        // Test 2: Send OTP to valid existing user
        console.log('Testing: Send OTP to valid user...');
        const sendResult = await sendOtpUseCase.execute({ email: testEmail });
        assert.equal(sendResult.success, true);
        assert.equal(mockOtpProvider.lastSentEmail, testEmail);
        assert.equal(mockOtpProvider.lastSentType, 'PASSWORD_RESET');
        console.log('✅ [3/9] Send OTP succeeded with PASSWORD_RESET type.');

        // Test 3: Verify OTP with wrong code should fail
        console.log('Testing: Verify OTP with invalid code...');
        await assert.rejects(
            async () => {
                await verifyOtpUseCase.execute({ email: testEmail, code: '000000' });
            },
            (err: any) => {
                assert.equal(err.code, 'INVALID_OTP');
                return true;
            }
        );
        console.log('✅ [4/9] Invalid OTP code rejected.');

        // Test 4: Verify OTP with correct code returns valid resetToken
        console.log('Testing: Verify OTP with valid code...');
        const verifyResult = await verifyOtpUseCase.execute({ email: testEmail, code: '123456' });
        assert.equal(verifyResult.success, true);
        assert.equal(verifyResult.verified, true);
        assert.ok(verifyResult.resetToken, 'Expected resetToken to be present');
        console.log('✅ [5/9] Valid OTP returned single-use resetToken.');

        // Test 5: Reset password with wrong current password (if currentPassword provided)
        console.log('Testing: Reset password with wrong current password...');
        await assert.rejects(
            async () => {
                await resetPasswordWithOtpUseCase.execute({
                    resetToken: verifyResult.resetToken,
                    currentPassword: 'WrongCurrentPassword999!',
                    newPassword: 'BrandNewSecurePassword2026!',
                    confirmPassword: 'BrandNewSecurePassword2026!',
                });
            },
            (err: any) => {
                assert.equal(err.code, 'INVALID_CURRENT_PASSWORD');
                return true;
            }
        );
        console.log('✅ [6/9] Wrong current password rejected.');

        // Test 6: Reset password with mismatched confirmation
        console.log('Testing: Reset password with mismatched confirmation...');
        await assert.rejects(
            async () => {
                await resetPasswordWithOtpUseCase.execute({
                    resetToken: verifyResult.resetToken,
                    currentPassword: initialPassword,
                    newPassword: 'BrandNewSecurePassword2026!',
                    confirmPassword: 'DifferentPassword123!',
                });
            },
            (err: any) => {
                assert.equal(err.code, 'PASSWORDS_DO_NOT_MATCH');
                return true;
            }
        );
        console.log('✅ [7/9] Mismatched confirmation rejected.');

        // Test 7: Reset password with valid data
        console.log('Testing: Reset password with valid token and credentials...');
        const newPassword = 'BrandNewSecurePassword2026!';
        await resetPasswordWithOtpUseCase.execute({
            resetToken: verifyResult.resetToken,
            currentPassword: initialPassword,
            newPassword,
            confirmPassword: newPassword,
        });
        console.log('✅ [8/9] Password successfully updated in database with Argon2.');

        // Verify password in DB actually changed and old password fails
        const updatedUser = await usersRepository.findByIdWithPassword(testUser.id);
        assert.ok(updatedUser?.passwordHash);
        const isOldValid = await hashProvider.compare(initialPassword, updatedUser.passwordHash);
        assert.equal(isOldValid, false, 'Old password should no longer be valid');
        const isNewValid = await hashProvider.compare(newPassword, updatedUser.passwordHash);
        assert.equal(isNewValid, true, 'New password should be valid');

        // Test 8: Replay attack prevention — Token single-use check
        console.log('Testing: Replay attack prevention (reusing consumed resetToken)...');
        await assert.rejects(
            async () => {
                await resetPasswordWithOtpUseCase.execute({
                    resetToken: verifyResult.resetToken,
                    newPassword: 'AnotherNewPassword999!',
                    confirmPassword: 'AnotherNewPassword999!',
                });
            },
            (err: any) => {
                assert.equal(err.code, 'TOKEN_ALREADY_USED');
                return true;
            }
        );
        console.log('✅ [9/9] Replayed resetToken blocked successfully (Replay Protection).');

        console.log('\n🎉 ALL 9 TEST CASES PASSED SUCCESSFULLY!');
    } finally {
        // Clean up test user
        try {
            await prisma.userRole.deleteMany({ where: { userId: testUser.id } });
            await prisma.auditLog.deleteMany({ where: { userId: testUser.id } });
            await prisma.userSession.deleteMany({ where: { userId: testUser.id } });
            await prisma.user.delete({ where: { id: testUser.id } });
            console.log(`🧹 Cleaned up temporary test user ${testEmail}`);
        } catch (cleanupErr) {
            console.warn('Warning during cleanup:', cleanupErr);
        }
        await prisma.$disconnect();
    }
}

runTests().then(() => {
    process.exit(0);
}).catch((err) => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
});
