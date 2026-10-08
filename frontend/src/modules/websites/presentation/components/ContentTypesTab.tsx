import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Button,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    Grid,
    Card,
    CardContent,
    CardActions,
    Divider,
} from '@mui/material';
import {
    Add,
    Search,
    Edit,
    Delete,
    ViewStream,
    Tag,
    Layers,
    ArrowForward,
    DataObject,
    Clear,
} from '@mui/icons-material';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import ContentTypeFormDialog from './ContentTypeFormDialog';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import {
    getContentTypesByWebsite,
    deleteContentType,
} from '../../infrastructure/services/content-types.service';
import type { ContentTypeDto } from '../../domain/dto/content-types.dto';

interface ContentTypesTabProps {
    websiteId: string;
    websiteName: string;
}

export const ContentTypesTab: React.FC<ContentTypesTabProps> = ({
    websiteId,
    websiteName,
}) => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const canCreate = hasPermission(user, 'content-types:create');
    const canUpdate = hasPermission(user, 'content-types:update');
    const canDelete = hasPermission(user, 'content-types:delete');

    const [contentTypes, setContentTypes] = useState<ContentTypeDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Dialogs state
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [selectedContentType, setSelectedContentType] = useState<ContentTypeDto | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<ContentTypeDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Notification
    const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

    const fetchContentTypes = useCallback(async () => {
        if (!websiteId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getContentTypesByWebsite(websiteId);
            setContentTypes(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load content types for this website');
        } finally {
            setLoading(false);
        }
    }, [websiteId]);

    useEffect(() => {
        fetchContentTypes();
    }, [fetchContentTypes]);

    const handleOpenCreate = () => {
        setSelectedContentType(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (ct: ContentTypeDto, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedContentType(ct);
        setFormDialogOpen(true);
    };

    const handleOpenDelete = (ct: ContentTypeDto, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setTypeToDelete(ct);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!typeToDelete) return;
        setIsDeleting(true);
        try {
            await deleteContentType(typeToDelete.id);
            setNotification({
                message: `Content type "${typeToDelete.name}" deleted successfully`,
                severity: 'success',
            });
            setDeleteDialogOpen(false);
            setTypeToDelete(null);
            fetchContentTypes();
        } catch (err: any) {
            setNotification({
                message: err.response?.data?.message || 'Failed to delete content type',
                severity: 'error',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleNavigateDetail = (contentTypeId: string) => {
        navigate(`/websites/${websiteId}/content-types/${contentTypeId}`);
    };

    // Filter content types by search query
    const filteredContentTypes = useMemo(() => {
        if (!searchQuery.trim()) return contentTypes;
        const q = searchQuery.toLowerCase().trim();
        return contentTypes.filter(
            (ct) =>
                ct.name.toLowerCase().includes(q) ||
                ct.slug.toLowerCase().includes(q) ||
                (ct.description && ct.description.toLowerCase().includes(q))
        );
    }, [contentTypes, searchQuery]);

    const totalFields = useMemo(() => {
        return contentTypes.reduce((acc, ct) => acc + (ct.fieldsCount || 0), 0);
    }, [contentTypes]);

    return (
        <Stack spacing={2.5}>
            {/* Header / Actions bar */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                }}
            >
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                        Content Types & Dynamic Resources
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                        Manage dynamic schemas, custom fields, and data structure for <strong>{websiteName}</strong>
                    </Typography>
                </Box>

                {canCreate && (
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<Add fontSize="small" />}
                        onClick={handleOpenCreate}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 1.5,
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            px: 1.75,
                            py: 0.5,
                        }}
                    >
                        New Content Type
                    </Button>
                )}
            </Box>

            {/* Notification alert */}
            {notification && (
                <Alert
                    severity={notification.severity}
                    onClose={() => setNotification(null)}
                    sx={{ borderRadius: 2 }}
                >
                    {notification.message}
                </Alert>
            )}

            {/* Stats Summary Bar */}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.75,
                            bgcolor: 'background.paper',
                        }}
                    >
                        <ViewStream sx={{ color: 'text.secondary', fontSize: 24 }} />
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                TOTAL CONTENT TYPES
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {contentTypes.length}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.75,
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Layers sx={{ color: 'text.secondary', fontSize: 24 }} />
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                DEFINED FIELDS
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {totalFields}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.75,
                            bgcolor: 'background.paper',
                        }}
                    >
                        <DataObject sx={{ color: 'text.secondary', fontSize: 24 }} />
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                HEADLESS API ARCHITECTURE
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.25, fontSize: '0.8125rem' }}>
                                Ready for Headless Items
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Search Filter */}
            <TextField
                placeholder="Search content types by name, slug or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                fullWidth
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchQuery('')}>
                                    <Clear fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                        sx: { borderRadius: 1.5, bgcolor: 'background.paper', fontSize: '0.8125rem' },
                    },
                }}
            />

            {/* Error state */}
            {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Loading state */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
                    <CircularProgress size={32} />
                </Box>
            ) : filteredContentTypes.length === 0 ? (
                /* Empty state */
                <Paper
                    variant="outlined"
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        borderColor: 'divider',
                    }}
                >
                    <ViewStream sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {searchQuery ? 'No matching content types found' : 'No content types yet'}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 440, mx: 'auto', mb: 2.5, fontSize: '0.8125rem' }}
                    >
                        {searchQuery
                            ? `No content types match "${searchQuery}". Try modifying your search filter.`
                            : 'Create your first content type (e.g. Products, Blog Posts, Services) to structure dynamic content for this website.'}
                    </Typography>
                    {canCreate && !searchQuery && (
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<Add fontSize="small" />}
                            onClick={handleOpenCreate}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600, fontSize: '0.8125rem' }}
                        >
                            Create First Content Type
                        </Button>
                    )}
                </Paper>
            ) : (
                /* Cards Grid */
                <Grid container spacing={2}>
                    {filteredContentTypes.map((ct) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ct.id}>
                            <Card
                                variant="outlined"
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 2,
                                    borderColor: 'divider',
                                    transition: 'all 0.15s ease-in-out',
                                    '&:hover': {
                                        borderColor: 'text.secondary',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    },
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, p: 2.25 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9375rem' }}>
                                            {ct.name}
                                        </Typography>
                                        <Chip
                                            icon={<Tag sx={{ fontSize: '13px !important' }} />}
                                            label={ct.slug}
                                            size="small"
                                            sx={{
                                                fontFamily: 'monospace',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                height: 22,
                                                bgcolor: 'action.hover',
                                            }}
                                        />
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mb: 1.5,
                                            fontSize: '0.8125rem',
                                            minHeight: 36,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {ct.description || 'No description provided for this content type.'}
                                    </Typography>

                                    <Divider sx={{ my: 1 }} />

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                            icon={<Layers sx={{ fontSize: '13px !important' }} />}
                                            label={`${ct.fieldsCount ?? 0} Fields`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontWeight: 500, fontSize: '0.75rem', height: 22 }}
                                        />
                                        <Chip
                                            icon={<DataObject sx={{ fontSize: '13px !important' }} />}
                                            label={`${ct.itemsCount ?? 0} Items`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontWeight: 500, fontSize: '0.75rem', height: 22 }}
                                        />
                                    </Box>
                                </CardContent>

                                <Divider />

                                <CardActions sx={{ px: 2, py: 1.25, justifyContent: 'space-between' }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                                        onClick={() => handleNavigateDetail(ct.id)}
                                        sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 500, fontSize: '0.75rem', py: 0.25 }}
                                    >
                                        Manage Type
                                    </Button>

                                    <Box sx={{ display: 'flex', gap: 0.25 }}>
                                        {canUpdate && (
                                            <Tooltip title="Edit Content Type">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleOpenEdit(ct, e)}
                                                    color="primary"
                                                >
                                                    <Edit sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {canDelete && (
                                            <Tooltip title="Delete Content Type">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleOpenDelete(ct, e)}
                                                    color="error"
                                                >
                                                    <Delete sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create / Edit Form Dialog */}
            <ContentTypeFormDialog
                open={formDialogOpen}
                websiteId={websiteId}
                contentType={selectedContentType}
                onClose={() => setFormDialogOpen(false)}
                onSuccess={() => {
                    setNotification({
                        message: selectedContentType
                            ? 'Content type updated successfully'
                            : 'Content type created successfully',
                        severity: 'success',
                    });
                    fetchContentTypes();
                }}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Content Type"
                description={`Are you sure you want to delete "${typeToDelete?.name}" (${typeToDelete?.slug})? All associated fields and content items will be permanently removed.`}
                confirmText="Delete"
                confirmColor="error"
                isLoading={isDeleting}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </Stack>
    );
};

export default ContentTypesTab;
