import { lazy } from 'react';

export const WebsitesListPage = lazy(() => import('./pages/WebsitesList.page'));
export const WebsiteDetailPage = lazy(() => import('./pages/WebsiteDetail.page'));
export const ContentTypeDetailPage = lazy(() => import('./pages/ContentTypeDetail.page'));
export const FormDetailPage = lazy(() => import('./pages/FormDetail.page'));
