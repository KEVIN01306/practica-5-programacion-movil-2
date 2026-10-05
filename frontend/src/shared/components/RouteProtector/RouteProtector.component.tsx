import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../core/store/authStore';
import { hasPermission, hasSomePermission } from '../../../core/utils/permissions';

interface RouteProtectorProps {
    requiredPermission?: string | string[];
    children: ReactNode;
}

/**
 * RouteProtector — permission-level guard for individual routes within FullLayout.
 *
 * ProtectedRoute handles global authentication (token existence + session validity).
 * RouteProtector handles fine-grained authorization (specific permissions per route).
 */
const RouteProtector = ({ requiredPermission, children }: RouteProtectorProps) => {
    const user = useAuthStore((state) => state.user);

    if (!requiredPermission) {
        return <>{children}</>;
    }

    const isAuthorized = Array.isArray(requiredPermission)
        ? hasSomePermission(user, requiredPermission)
        : hasPermission(user, requiredPermission);

    if (!isAuthorized) {
        return <Navigate to="/access-denied" replace />;
    }

    return <>{children}</>;
};

export default RouteProtector;

