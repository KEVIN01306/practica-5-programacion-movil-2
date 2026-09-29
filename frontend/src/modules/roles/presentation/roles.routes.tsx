import type { RouteObject } from 'react-router-dom';
import { RolesManagementPage } from './roles.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const rolesRoutes: RouteObject[] = [
    {
        index: true,
        element: (
            <RouteProtector requiredPermission="roles:read">
                <RolesManagementPage />
            </RouteProtector>
        ),
    },
];
