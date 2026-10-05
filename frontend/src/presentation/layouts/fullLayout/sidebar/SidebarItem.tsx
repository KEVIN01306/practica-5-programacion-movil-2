import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Tooltip,
    Collapse,
    List,
    Box,
    Divider,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import type { MenuItem } from './menuItems';
import { useSidebar } from './SidebarContext';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasSomePermission } from '../../../../core/utils/permissions';

interface SidebarItemProps {
    item: MenuItem;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ item }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isCollapsed, closeMobileSidebar } = useSidebar();
    const user = useAuthStore((state) => state.user);

    const [openSubmenu, setOpenSubmenu] = useState(false);

    // Permission check
    if (item.permissions && item.permissions.length > 0 && !hasSomePermission(user, item.permissions)) {
        return null;
    }

    // 1. Group Header
    if (item.group) {
        if (isCollapsed) {
            return <Divider sx={{ my: 1, borderColor: '#e2e8f0' }} />;
        }
        return (
            <Box sx={{ px: 3, pt: 2, pb: 0.5 }}>
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05rem',
                    }}
                >
                    {item.group}
                </Typography>
            </Box>
        );
    }

    const IconComponent = item.icon;
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isActive = item.link
        ? item.link === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.link)
        : false;

    const handleClick = () => {
        if (hasChildren) {
            setOpenSubmenu(!openSubmenu);
        } else if (item.link) {
            navigate(item.link);
            closeMobileSidebar();
        }
    };

    const buttonContent = (
        <ListItemButton
            selected={isActive}
            onClick={handleClick}
            sx={{
                minHeight: 44,
                px: isCollapsed ? 2 : 2.5,
                py: 1,
                mx: isCollapsed ? 1 : 1.5,
                my: 0.25,
                borderRadius: '10px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                backgroundColor: isActive ? 'rgba(0, 107, 255, 0.08)' : 'transparent',
                '&:hover': {
                    backgroundColor: isActive ? 'rgba(0, 107, 255, 0.12)' : '#f8fafc',
                },
                '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 107, 255, 0.08)',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 107, 255, 0.14)',
                    },
                },
            }}
        >
            {IconComponent && (
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: isCollapsed ? 0 : 1.75,
                        justifyContent: 'center',
                        color: isActive ? '#006bff' : '#64748b',
                    }}
                >
                    <IconComponent sx={{ fontSize: 20 }} />
                </ListItemIcon>
            )}

            {!isCollapsed && (
                <ListItemText
                    primary={item.name}
                    slotProps={{
                        primary: {
                            variant: 'body2',
                            sx: {
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#006bff' : '#334155',
                                fontSize: '13px',
                            },
                        },
                    }}
                />
            )}

            {!isCollapsed && hasChildren && (
                openSubmenu ? <ExpandLess sx={{ fontSize: 18, color: '#94a3b8' }} /> : <ExpandMore sx={{ fontSize: 18, color: '#94a3b8' }} />
            )}
        </ListItemButton>
    );

    return (
        <>
            {isCollapsed ? (
                <Tooltip title={item.name ?? ''} placement="right" arrow>
                    {buttonContent}
                </Tooltip>
            ) : (
                buttonContent
            )}

            {hasChildren && !isCollapsed && (
                <Collapse in={openSubmenu} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 2 }}>
                        {item.children?.map((child, idx) => (
                            <SidebarItem key={child.name || idx} item={child} />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

export default SidebarItem;
