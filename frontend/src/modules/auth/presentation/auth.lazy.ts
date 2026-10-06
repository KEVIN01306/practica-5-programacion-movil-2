import { lazy } from 'react';

export const LoginPage = lazy(() => import('./pages/Login.page'));
export const PasswordResetRequestPage = lazy(() => import('./pages/PasswordResetRequest.page'));
export const PasswordResetVerifyPage = lazy(() => import('./pages/PasswordResetVerify.page'));
export const PasswordResetNewPage = lazy(() => import('./pages/PasswordResetNew.page'));
export const PasswordResetSuccessPage = lazy(() => import('./pages/PasswordResetSuccess.page'));

export const VerifyAccountRequestPage = lazy(() => import('./pages/VerifyAccountRequest.page'));
export const VerifyAccountOtpPage = lazy(() => import('./pages/VerifyAccountOtp.page'));
export const VerifyAccountPasswordPage = lazy(() => import('./pages/VerifyAccountPassword.page'));
export const VerifyAccountSuccessPage = lazy(() => import('./pages/VerifyAccountSuccess.page'));
