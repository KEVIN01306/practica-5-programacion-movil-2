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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
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

    const handleOpenEdit = (f: FormDto, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedForm(f);
        setFormDialogOpen(true);
    };

    const handleOpenDelete = (f: FormDto, e?: React.MouseEvent) => {
        e?.stopPropagation();
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

    const totalFields = useMemo(() => {
        return forms.reduce((acc, curr) => acc + (curr.fieldsCount || 0), 0);
    }, [forms]);

    const totalSubmissions = useMemo(() => {
        return forms.reduce((acc, curr) => acc + (curr.submissionsCount || 0), 0);
    }, [forms]);

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
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 180,
                    }}
                >
                    <CircularProgress size={32} />
                </Box>
            ) : filteredForms.length === 0 ? (
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
                    <DynamicForm sx={{ fontSize: 38, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {searchQuery ? 'No matching forms found' : 'No forms yet'}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 440, mx: 'auto', mb: 2.5, fontSize: '0.8125rem' }}
                    >
                        {searchQuery
                            ? `No forms match "${searchQuery}". Try modifying your search query.`
                            : 'Create your first form (e.g. Contact Form, Newsletter, Quote Request) to collect structured submissions.'}
                    </Typography>
                    {canCreate && !searchQuery && (
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
                            }}
                        >
                            Create First Form
                        </Button>
                    )}
                </Paper>
            ) : (
                /* Forms Table */
                <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ borderRadius: 2, borderColor: 'divider', overflow: 'hidden' }}
                >
                    <Table size="small">
                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1.5 }}>
                                    NAME
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1.5 }}>
                                    ENDPOINT SLUG
                                </TableCell>
                                <TableCell
                                    align="center"
                                    sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1.5 }}
                                >
                                    NOTIFICATIONS
                                </TableCell>
                                <TableCell
                                    align="center"
                                    sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1.5 }}
                                >
                                    FIELDS
                                </TableCell>
                                <TableCell
                                    align="center"
                                    sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1.5 }}
                                >
                                    SUBMISSIONS
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1.5 }}>
                                    UPDATED
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1.5, pr: 2 }}
                                >
                                    ACTIONS
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredForms.map((f) => (
                                <TableRow
                                    key={f.id}
                                    hover
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => navigate(`/websites/${websiteId}/forms/${f.id}`)}
                                >
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {f.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Chip
                                            label={`/forms/${f.slug}/submit`}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontFamily: 'monospace',
                                                fontSize: '0.75rem',
                                                height: 22,
                                                bgcolor: 'action.hover',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        {f.sendEmail ? (
                                            <Tooltip
                                                title={`Recipients: ${(f.recipientEmails || []).join(', ') || 'None'}${
                                                    f.emailTemplate ? ` • Template: ${f.emailTemplate.name}` : ''
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
                                        )}
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Chip
                                            label={`${f.fieldsCount || 0} fields`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem', height: 22 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Chip
                                            label={`${f.submissionsCount || 0} entries`}
                                            size="small"
                                            color={f.submissionsCount ? 'primary' : 'default'}
                                            variant={f.submissionsCount ? 'filled' : 'outlined'}
                                            sx={{ fontSize: '0.7rem', height: 22, fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(f.updatedAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1.5, pr: 2 }} onClick={(e) => e.stopPropagation()}>
                                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                                            <Tooltip title="Manage Form & Fields">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => navigate(`/websites/${websiteId}/forms/${f.id}`)}
                                                >
                                                    <ArrowForward fontSize="small" sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                            {canUpdate && (
                                                <Tooltip title="Edit Form Settings">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleOpenEdit(f, e)}
                                                    >
                                                        <Edit fontSize="small" sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {canDelete && (
                                                <Tooltip title="Delete Form">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={(e) => handleOpenDelete(f, e)}
                                                    >
                                                        <Delete fontSize="small" sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

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
