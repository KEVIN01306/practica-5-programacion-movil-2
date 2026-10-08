import type { RouteObject } from 'react-router-dom';
import { ContactsListPage, ContactDetailPage } from './contacts.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const contactsRoutes: RouteObject[] = [
    {
        index: true,
        element: (
            <RouteProtector requiredPermission="contacts:read">
                <ContactsListPage />
            </RouteProtector>
        ),
    },
    {
        path: ':contactId',
        element: (
            <RouteProtector requiredPermission="contacts:read">
                <ContactDetailPage />
            </RouteProtector>
        ),
    },
];
