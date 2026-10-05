import type { RouteObject } from 'react-router-dom';
import { BrandsListPage, BrandDetailPage } from './brands.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const brandsRoutes: RouteObject[] = [
    {
        index: true,
        element: (
            <RouteProtector requiredPermission="brands:read">
                <BrandsListPage />
            </RouteProtector>
        ),
    },
    {
        path: ':id',
        element: (
            <RouteProtector requiredPermission="brands:read">
                <BrandDetailPage />
            </RouteProtector>
        ),
    },
];
