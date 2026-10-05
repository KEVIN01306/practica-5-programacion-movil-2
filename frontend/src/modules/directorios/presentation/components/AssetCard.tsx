import React, { useState } from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    MoreVert,
    Visibility,
    SwapHoriz,
    Edit,
    Delete,
    PictureAsPdf,
    InsertDriveFile,
} from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import type { AssetDto } from '../../domain/dto/assets.dto';

interface AssetCardProps {
    asset: AssetDto;
    onView: (asset: AssetDto) => void;
    onReplace: (asset: AssetDto) => void;
    onEdit: (asset: AssetDto) => void;
    onDelete: (asset: AssetDto) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
    asset,
    onView,
    onReplace,
    onEdit,
    onDelete,
}) => {
    const user = useAuthStore((state) => state.user);
    const canUpdate = hasPermission(user, 'assets:update');
    const canDelete = hasPermission(user, 'assets:delete');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Visual cache-busting using updatedAt timestamp so the browser immediately reflects physical replaces
    const cacheBustedUrl = `${asset.url}?v=${new Date(asset.updatedAt).getTime()}`;

    const renderThumbnail = () => {
        if (asset.type === 'IMAGE') {
            return (
                <CardMedia
                    component="img"
                    image={cacheBustedUrl}
                    alt={asset.name}
                    loading="lazy"
                    sx={{
                        height: 160,
                        width: '100%',
                        objectFit: 'cover',
                        bgcolor: 'action.hover',
                    }}
                />
            );
        }

        return (
            <Box
                sx={{
                    height: 160,
                    width: '100%',
                    bgcolor: 'action.hover',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                }}
            >
                {asset.extension === 'pdf' ? (
                    <PictureAsPdf sx={{ fontSize: 48, color: '#ef4444' }} />
                ) : (
                    <InsertDriveFile sx={{ fontSize: 48, color: 'text.secondary' }} />
                )}
                <Chip
                    size="small"
                    label={asset.extension?.toUpperCase() || asset.type}
                    sx={{ fontSize: '10px', height: 20 }}
                />
            </Box>
        );
    };

    return (
        <Card
            elevation={0}
            onClick={() => onView(asset)}
            sx={{
                borderRadius: '14px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    borderColor: 'primary.light',
                },
            }}
        >
            {/* Media Box with overlay chips */}
            <Box sx={{ position: 'relative' }}>
                {renderThumbnail()}

                {/* Top overlay badges */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        right: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {asset.sku ? (
                        <Chip
                            size="small"
                            label={asset.sku}
                            sx={{
                                height: 22,
                                fontSize: '11px',
                                fontWeight: 700,
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(4px)',
                                color: 'primary.dark',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                        />
                    ) : <Box />}

                    <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)', borderRadius: '50%', backdropFilter: 'blur(4px)' }}>
                        <IconButton
                            size="small"
                            onClick={handleMenuOpen}
                            sx={{ color: 'text.primary', p: 0.5 }}
                        >
                            <MoreVert fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleMenuClose}
                    onClick={(e) => e.stopPropagation()}
                    slotProps={{
                        paper: {
                            sx: { borderRadius: '12px', minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
                        },
                    }}
                >
                    <MenuItem
                        onClick={() => {
                            handleMenuClose();
                            onView(asset);
                        }}
                    >
                        <ListItemIcon>
                            <Visibility fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="View Details" />
                    </MenuItem>
                    {canUpdate && (
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                onReplace(asset);
                            }}
                        >
                            <ListItemIcon>
                                <SwapHoriz fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Replace File" />
                        </MenuItem>
                    )}
                    {canUpdate && (
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                onEdit(asset);
                            }}
                        >
                            <ListItemIcon>
                                <Edit fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Edit Information" />
                        </MenuItem>
                    )}
                    {canDelete && (
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                onDelete(asset);
                            }}
                            sx={{ color: 'error.main' }}
                        >
                            <ListItemIcon sx={{ color: 'error.main' }}>
                                <Delete fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Delete Asset" />
                        </MenuItem>
                    )}
                </Menu>
            </Box>

            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 600,
                        fontSize: '13px',
                        color: 'text.primary',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {asset.name}
                </Typography>

                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: 18,
                    }}
                >
                    {asset.description || asset.fileName}
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 'auto',
                        pt: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px', fontWeight: 500 }}>
                        {formatBytes(asset.sizeBytes)}
                    </Typography>
                    <Chip
                        size="small"
                        label={asset.extension ? `.${asset.extension}` : asset.type}
                        sx={{
                            fontSize: '10px',
                            height: 18,
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default AssetCard;
