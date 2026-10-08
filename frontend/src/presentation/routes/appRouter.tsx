import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { authRoutes } from '../../modules/auth/presentation/auth.routes';
import { websitesRoutes } from '../../modules/websites/presentation/websites.routes';
import { contactsRoutes } from '../../modules/contacts/presentation/contacts.routes';
import { usersRoutes } from '../../modules/users/presentation/users.routes';
import { profileRoutes } from '../../modules/profile/presentation/profile.routes';
import { auditRoutes } from '../../modules/audit/presentation/audit.routes';
import { rolesRoutes } from '../../modules/roles/presentation/roles.routes';
import ProtectedRoute from './ProtectedRoute';

import { FullPageLoader } from '../../shared/components/loaders';
import { AccessDeniedPage } from '../../shared/pages';
import DashboardPage from '../../shared/pages/Dashboard.page';

const BlankLayout = lazy(() => import('../layouts/blankLayout'));
const FullLayout = lazy(() => import('../layouts/fullLayout'));

export const appRouter = createBrowserRouter([
    // ── Public routes (unauthenticated) ──────────────────────────────────────
    {
        path: '/auth',
        element: (
            <Suspense fallback={<FullPageLoader />}>
                <BlankLayout />
            </Suspense>
        ),
        children: [...authRoutes],
    },

    // ── Protected routes (authenticated) ─────────────────────────────────────
    {
        path: '/',
        element: (
            <Suspense fallback={<FullPageLoader />}>
                <ProtectedRoute />
            </Suspense>
        ),
        children: [
            {
                element: (
                    <Suspense fallback={<FullPageLoader />}>
                        <FullLayout />
                    </Suspense>
                ),
                children: [
                    // Dashboard — default route
                    {
                        index: true,
                        element: <DashboardPage />,
                    },

                    // Access Denied — reached when RouteProtector denies access
                    {
                        path: 'access-denied',
                        element: <AccessDeniedPage />,
                    },

                    // ── Module routes ──
                    {
                        path: 'websites',
                        children: [...websitesRoutes],
                    },
                    {
                        path: 'contacts',
                        children: [...contactsRoutes],
                    },
                    {
                        path: 'users',
                        children: [...usersRoutes],
                    },
                    {
                        path: 'audit-logs',
                        children: [...auditRoutes],
                    },
                    {
                        path: 'roles',
                        children: [...rolesRoutes],
                    },
                    {
                        path: 'profile',
                        children: [...profileRoutes],
                    },
                ],
            },
        ],
    },

    // ── Catch-all — redirect unknown paths to home ────────────────────────────
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
