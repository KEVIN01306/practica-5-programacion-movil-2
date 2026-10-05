import type { RouteObject } from 'react-router-dom';
import { UsersListPage } from './users.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const usersRoutes: RouteObject[] = [
    {
        index: true,
        element: (
            <RouteProtector requiredPermission="users:read">
                <UsersListPage />
            </RouteProtector>
        ),
    },
];
