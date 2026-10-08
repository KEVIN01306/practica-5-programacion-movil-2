import { lazy } from 'react';

export const ContactsListPage = lazy(() => import('./pages/ContactsList.page'));
export const ContactDetailPage = lazy(() => import('./pages/ContactDetail.page'));
