import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Stack,
    Chip,
    Divider,
    IconButton,
    Paper,
} from '@mui/material';
import {
    Close,
    Edit,
    SwapHoriz,
    Delete,
    OpenInNew,
    ContentCopy,
    InsertDriveFile,
} from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import type { AssetDto } from '../../domain/dto/assets.dto';

interface AssetDetailDialogProps {
    asset: AssetDto | null;
    open: boolean;
    onClose: () => void;
    onEdit: (asset: AssetDto) => void;
    onReplace: (asset: AssetDto) => void;
    onDelete: (asset: AssetDto) => void;
}

export const AssetDetailDialog: React.FC<AssetDetailDialogProps> = ({
    asset,
    open,
    onClose,
    onEdit,
    onReplace,
    onDelete,
}) => {
    const user = useAuthStore((state) => state.user);
    const canUpdate = hasPermission(user, 'assets:update');
    const canDelete = hasPermission(user, 'assets:delete');

    if (!asset) return null;

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Cache-busting parameter for visual rendering only
    const cacheBustedUrl = `${asset.url}?v=${new Date(asset.updatedAt).getTime()}`;

    const copyUrl = () => {
        navigator.clipboard.writeText(asset.url);
        alert('Public URL copied to clipboard!');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '16px',
                        p: 1,
                    },
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                        Asset Details
                    </Typography>
                    {asset.sku && (
                        <Chip
                            label={`SKU: ${asset.sku}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: '11px' }}
                        />
                    )}
                    <Chip
                        label={asset.type}
                        size="small"
                        sx={{ fontWeight: 500, fontSize: '11px', bgcolor: 'action.hover' }}
                    />
                </Box>
                <IconButton size="small" onClick={onClose}>
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 1 }}>
                    {/* Media Preview Box */}
                    <Box
                        sx={{
                            width: { xs: '100%', md: '50%' },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{
                                width: '100%',
                                minHeight: 280,
                                maxHeight: 380,
                                borderRadius: '12px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'action.hover',
                                position: 'relative',
                            }}
                        >
                            {asset.type === 'IMAGE' ? (
                                <Box
                                    component="img"
                                    src={cacheBustedUrl}
                                    alt={asset.name}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        maxHeight: 380,
                                        objectFit: 'contain',
                                        display: 'block',
                                    }}
                                />
                            ) : (
                                <Stack sx={{ alignItems: 'center', p: 4 }} spacing={1}>
                                    <InsertDriveFile sx={{ fontSize: 64, color: 'text.secondary' }} />
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {asset.extension?.toUpperCase() || 'FILE'} Document
                                    </Typography>
                                </Stack>
                            )}
                        </Paper>

                        {/* Public Link Action */}
                        <Box sx={{ mt: 1.5, width: '100%', display: 'flex', gap: 1 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                startIcon={<OpenInNew />}
                                href={asset.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textTransform: 'none', borderRadius: '8px', fontSize: '12px' }}
                            >
                                Open in R2
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ContentCopy />}
                                onClick={copyUrl}
                                sx={{ textTransform: 'none', borderRadius: '8px', fontSize: '12px', whiteSpace: 'nowrap' }}
                            >
                                Copy URL
                            </Button>
                        </Box>
                    </Box>

                    {/* Metadata Details */}
                    <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                            {asset.name}
                        </Typography>

                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            {asset.description || 'No description provided.'}
                        </Typography>

                        <Divider sx={{ my: 1.5 }} />

                        {/* Technical Information Grid */}
                        <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Brand:
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {asset.brand?.name || '—'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Directory / Folder:
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {asset.folder?.name || 'Root Level'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Original File Name:
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        maxWidth: 200,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {asset.fileName}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    MIME Type:
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {asset.mimeType}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    File Size:
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {formatBytes(asset.sizeBytes)} ({asset.sizeBytes.toLocaleString()} bytes)
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Extension:
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {asset.extension ? `.${asset.extension}` : '—'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Uploaded:
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.primary' }}>
                                    {new Date(asset.createdAt).toLocaleString()}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Last Updated:
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.primary' }}>
                                    {new Date(asset.updatedAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, pt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                    {canDelete && (
                        <Button
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => onDelete(asset)}
                            sx={{ textTransform: 'none', borderRadius: '10px' }}
                        >
                            Delete Asset
                        </Button>
                    )}
                </Box>

                <Stack direction="row" spacing={1.5}>
                    {canUpdate && (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<SwapHoriz />}
                                onClick={() => onReplace(asset)}
                                sx={{ textTransform: 'none', borderRadius: '10px' }}
                            >
                                Replace File
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Edit />}
                                onClick={() => onEdit(asset)}
                                sx={{ textTransform: 'none', borderRadius: '10px' }}
                            >
                                Edit Details
                            </Button>
                        </>
                    )}
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default AssetDetailDialog;
