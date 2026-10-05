import type { RouteObject } from 'react-router-dom';
import { DirectoriosIndexPage } from './directorios.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const directoriosRoutes: RouteObject[] = [
    {
        index: true,
        element: (
            <RouteProtector requiredPermission={['folders:read', 'assets:read', 'brands:read']}>
                <DirectoriosIndexPage />
            </RouteProtector>
        ),
    },
];
