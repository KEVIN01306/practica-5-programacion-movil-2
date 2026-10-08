import {
    DashboardOutlined,
    LanguageOutlined,
    ContactsOutlined,
    GroupOutlined,
    AdminPanelSettingsOutlined,
    ManageHistoryOutlined,
    ShieldOutlined,
} from '@mui/icons-material';
import type { ElementType } from 'react';

export interface MenuItem {
    name?: string;
    module?: string;
    group?: string;
    link?: string;
    icon?: ElementType;
    permissions?: string[];
    requiresStudent?: boolean;
    requiresTeacher?: boolean;
    children?: MenuItem[];
}

const MenuItems: MenuItem[] = [
    { group: 'Main' },
    {
        name: 'Dashboard',
        icon: DashboardOutlined,
        link: '/',
    },

    { group: 'Sites & Audience', permissions: ['websites:read', 'contacts:read'] },
    {
        module: 'Websites',
        name: 'Websites',
        icon: LanguageOutlined,
        link: '/websites',
        permissions: ['websites:read'],
    },
    {
        module: 'Contacts',
        name: 'Contacts',
        icon: ContactsOutlined,
        link: '/contacts',
        permissions: ['contacts:read'],
    },

    { group: 'Administration', permissions: ['users:read', 'roles:read', 'audit:read', 'roles:permissions:update'] },
    {
        module: 'Users',
        name: 'Users Management',
        icon: GroupOutlined,
        link: '/users',
        permissions: ['users:read'],
    },
    {
        module: 'Roles',
        name: 'Roles & Permissions',
        icon: ShieldOutlined,
        link: '/roles',
        permissions: ['roles:read', 'roles:permissions:update'],
    },
    {
        module: 'Audit',
        name: 'Audit Logs',
        icon: ManageHistoryOutlined,
        link: '/audit-logs',
        permissions: ['audit:read'],
    },

    { group: 'Account' },
    {
        name: 'My Profile',
        icon: AdminPanelSettingsOutlined,
        link: '/profile',
    },
];

export default MenuItems;
