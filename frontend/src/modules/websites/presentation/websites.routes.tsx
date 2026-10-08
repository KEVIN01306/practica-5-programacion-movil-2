import type { RouteObject } from 'react-router-dom';
import {
    WebsitesListPage,
    WebsiteDetailPage,
    ContentTypeDetailPage,
    FormDetailPage,
} from './websites.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const websitesRoutes: RouteObject[] = [
    {
        index: true,
        element: (
            <RouteProtector requiredPermission="websites:read">
                <WebsitesListPage />
            </RouteProtector>
        ),
    },
    {
        path: ':id',
        element: (
            <RouteProtector requiredPermission="websites:read">
                <WebsiteDetailPage />
            </RouteProtector>
        ),
    },
    {
        path: ':websiteId/content-types/:contentTypeId',
        element: (
            <RouteProtector requiredPermission="content-types:read">
                <ContentTypeDetailPage />
            </RouteProtector>
        ),
    },
    {
        path: ':websiteId/forms/:formId',
        element: (
            <RouteProtector requiredPermission="forms:read">
                <FormDetailPage />
            </RouteProtector>
        ),
    },
];
