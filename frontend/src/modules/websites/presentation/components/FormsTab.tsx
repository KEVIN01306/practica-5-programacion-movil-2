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
    Alert,
    TextField,
    InputAdornment,
    Grid,
} from '@mui/material';
import {
    Add,
    Search,
    Edit,
    Delete,
    DynamicForm,
    ViewStream,
    Inbox,
    MarkEmailRead,
    NotificationsOff,
    Clear,
    Refresh,
    ArrowForward,
} from '@mui/icons-material';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import ListTable, { type Column, type Action } from '../../../../shared/components/tables/ListTable';
import FormFormDialog from './FormFormDialog';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import {
    getFormsByWebsite,
    deleteForm,
} from '../../infrastructure/services/forms.service';
import type { FormDto } from '../../domain/dto/forms.dto';

interface FormsTabProps {
    websiteId: string;
    websiteName?: string;
    websiteDomain?: string;
}

export const FormsTab: React.FC<FormsTabProps> = ({ websiteId, websiteDomain }) => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const canCreate = hasPermission(user, 'forms:create');
    const canUpdate = hasPermission(user, 'forms:update');
    const canDelete = hasPermission(user, 'forms:delete');

    const [forms, setForms] = useState<FormDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);

    // Dialogs state
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [selectedForm, setSelectedForm] = useState<FormDto | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [formToDelete, setFormToDelete] = useState<FormDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Notification toast
    const [notification, setNotification] = useState<{
        message: string;
        severity: 'success' | 'error';
    } | null>(null);

    const fetchForms = useCallback(async () => {
        if (!websiteId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getFormsByWebsite(websiteId);
            setForms(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load forms for this website');
        } finally {
            setLoading(false);
        }
    }, [websiteId]);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const handleOpenCreate = () => {
        setSelectedForm(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (f: FormDto) => {
        setSelectedForm(f);
        setFormDialogOpen(true);
    };

    const handleOpenDelete = (f: FormDto) => {
        setFormToDelete(f);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!formToDelete) return;
        setIsDeleting(true);
        try {
            await deleteForm(formToDelete.id);
            setNotification({
                message: `Form "${formToDelete.name}" deleted successfully`,
                severity: 'success',
            });
            setDeleteDialogOpen(false);
            setFormToDelete(null);
            fetchForms();
        } catch (err: any) {
            setNotification({
                message: err.response?.data?.message || 'Failed to delete form',
                severity: 'error',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredForms = useMemo(() => {
        if (!searchQuery.trim()) return forms;
        const q = searchQuery.toLowerCase();
        return forms.filter(
            (f) =>
                f.name.toLowerCase().includes(q) ||
                f.slug.toLowerCase().includes(q)
        );
    }, [forms, searchQuery]);

    const paginatedForms = useMemo(() => {
        return filteredForms.slice(page * limit, (page + 1) * limit);
    }, [filteredForms, page, limit]);

    const totalFields = useMemo(() => {
        return forms.reduce((acc, curr) => acc + (curr.fieldsCount || 0), 0);
    }, [forms]);

    const totalSubmissions = useMemo(() => {
        return forms.reduce((acc, curr) => acc + (curr.submissionsCount || 0), 0);
    }, [forms]);

    const columns: Column[] = useMemo(
        () => [
            {
                id: 'name',
                name: 'Form Name',
                format: (_val: unknown, row: FormDto) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <DynamicForm sx={{ color: 'primary.main', fontSize: 18 }} />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '0.8125rem',
                                    color: 'primary.main',
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                                onClick={() => navigate(`/websites/${websiteId}/forms/${row.id}`)}
                            >
                                {row.name}
                            </Typography>
                        </Box>
                    </Box>
                ),
            },
            {
                id: 'slug',
                name: 'Endpoint Slug',
                format: (val: string) => (
                    <Chip
                        label={`/forms/${val}/submit`}
                        size="small"
                        variant="outlined"
                        sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            height: 22,
                            bgcolor: 'action.hover',
                        }}
                    />
                ),
            },
            {
                id: 'sendEmail',
                name: 'Notifications',
                format: (_val: unknown, row: FormDto) =>
                    row.sendEmail ? (
                        <Tooltip
                            title={`Recipients: ${(row.recipientEmails || []).join(', ') || 'None'}${
                                row.emailTemplate ? ` • Template: ${row.emailTemplate.name}` : ''
                            }`}
                        >
                            <Chip
                                icon={<MarkEmailRead sx={{ fontSize: '13px !important' }} />}
                                label="Email Enabled"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 22, fontWeight: 600 }}
                            />
                        </Tooltip>
                    ) : (
                        <Chip
                            icon={<NotificationsOff sx={{ fontSize: '13px !important' }} />}
                            label="Disabled"
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 22, color: 'text.secondary' }}
                        />
                    ),
            },
            {
                id: 'fieldsCount',
                name: 'Fields',
                format: (val: number) => (
                    <Chip
                        label={`${val || 0} fields`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                ),
            },
            {
                id: 'submissionsCount',
                name: 'Submissions',
                format: (val: number) => (
                    <Chip
                        label={`${val || 0} entries`}
                        size="small"
                        color={val ? 'primary' : 'default'}
                        variant={val ? 'filled' : 'outlined'}
                        sx={{ fontSize: '0.7rem', height: 22, fontWeight: 600 }}
                    />
                ),
            },
            {
                id: 'updatedAt',
                name: 'Updated',
                format: (val: string) => (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {new Date(val).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </Typography>
                ),
            },
        ],
        []
    );

    const actions: Action[] = useMemo(
        () => [
            {
                name: 'Manage Form & Fields',
                icon: <ArrowForward sx={{ fontSize: 16 }} />,
                color: 'primary',
                onClick: (row: FormDto) => navigate(`/websites/${websiteId}/forms/${row.id}`),
            },
            ...(canUpdate
                ? [
                      {
                          name: 'Edit Settings',
                          icon: <Edit sx={{ fontSize: 16 }} />,
                          color: '#2563eb',
                          onClick: (row: FormDto) => handleOpenEdit(row),
                      },
                  ]
                : []),
            ...(canDelete
                ? [
                      {
                          name: 'Delete Form',
                          icon: <Delete sx={{ fontSize: 16 }} />,
                          color: '#ef4444',
                          onClick: (row: FormDto) => handleOpenDelete(row),
                      },
                  ]
                : []),
        ],
        [canUpdate, canDelete, navigate, websiteId]
    );

    return (
        <Stack spacing={2.5}>
            {/* Header & New Form Button */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DynamicForm sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            Forms & Submissions
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8125rem' }}>
                        Manage form endpoints, custom field schemas, and collect submissions from your website.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Tooltip title="Refresh list">
                        <IconButton
                            size="small"
                            onClick={fetchForms}
                            disabled={loading}
                            sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5 }}
                        >
                            <Refresh fontSize="small" />
                        </IconButton>
                    </Tooltip>
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
                                px: 2,
                            }}
                        >
                            New Form
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* Notification alert banner */}
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
                        <DynamicForm sx={{ color: 'text.secondary', fontSize: 24 }} />
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            >
                                ACTIVE FORMS
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {forms.length}
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
                        <ViewStream sx={{ color: 'text.secondary', fontSize: 24 }} />
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            >
                                CONFIGURED FIELDS
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
                        <Inbox sx={{ color: 'text.secondary', fontSize: 24 }} />
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            >
                                TOTAL SUBMISSIONS
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {totalSubmissions}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Search Filter */}
            <TextField
                placeholder="Search forms by name or endpoint slug..."
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                }}
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
                                <IconButton size="small" onClick={() => { setSearchQuery(''); setPage(0); }}>
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

            {/* ListTable Component */}
            <ListTable
                columns={columns}
                data={paginatedForms}
                actions={actions}
                pagination={{
                    total: filteredForms.length,
                    limit,
                    offset: page * limit,
                    onPageChange: (newPage: number) => setPage(newPage),
                    onRowsPerPageChange: (newLimit: number) => {
                        setLimit(newLimit);
                        setPage(0);
                    },
                }}
                emptyMessage={
                    loading
                        ? 'Loading forms...'
                        : searchQuery
                        ? `No forms match "${searchQuery}".`
                        : 'No forms yet. Create your first form to collect structured submissions.'
                }
            />

            {/* Create / Edit Form Dialog */}
            <FormFormDialog
                open={formDialogOpen}
                websiteId={websiteId}
                websiteDomain={websiteDomain}
                form={selectedForm}
                onClose={() => setFormDialogOpen(false)}
                onSuccess={(saved) => {
                    setNotification({
                        message: selectedForm
                            ? `Form "${saved.name}" updated successfully`
                            : `Form "${saved.name}" created successfully`,
                        severity: 'success',
                    });
                    fetchForms();
                }}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Form"
                description={`Are you sure you want to permanently delete "${formToDelete?.name}"? All configured fields and received submissions will be deleted.`}
                confirmText="Delete Form"
                confirmColor="error"
                isLoading={isDeleting}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setFormToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </Stack>
    );
};

export default FormsTab;
