import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
    Visibility,
    MarkEmailRead,
    Email,
    AssignmentOutlined,
    DynamicFeed,
    Clear,
    Refresh,
} from '@mui/icons-material';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import EmailTemplateFormDialog from './EmailTemplateFormDialog';
import EmailTemplatePreviewDialog from './EmailTemplatePreviewDialog';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import {
    getEmailTemplatesByWebsite,
    deleteEmailTemplate,
} from '../../infrastructure/services/email-templates.service';
import type { EmailTemplateDto } from '../../domain/dto/email-templates.dto';

interface EmailTemplatesTabProps {
    websiteId: string;
    websiteName: string;
}

export const EmailTemplatesTab: React.FC<EmailTemplatesTabProps> = ({
    websiteId,
    websiteName,
}) => {
    const user = useAuthStore((state) => state.user);

    const canCreate = hasPermission(user, 'email-templates:create');
    const canUpdate = hasPermission(user, 'email-templates:update');
    const canDelete = hasPermission(user, 'email-templates:delete');

    const [templates, setTemplates] = useState<EmailTemplateDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Dialogs state
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateDto | null>(null);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateDto | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<EmailTemplateDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Feedback notification
    const [notification, setNotification] = useState<{
        message: string;
        severity: 'success' | 'error';
    } | null>(null);

    const fetchTemplates = useCallback(async () => {
        if (!websiteId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getEmailTemplatesByWebsite(websiteId);
            setTemplates(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load email templates for this website');
        } finally {
            setLoading(false);
        }
    }, [websiteId]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleOpenCreate = () => {
        setSelectedTemplate(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (tmpl: EmailTemplateDto, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedTemplate(tmpl);
        setFormDialogOpen(true);
    };

    const handleOpenPreview = (tmpl: EmailTemplateDto, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setPreviewTemplate(tmpl);
        setPreviewDialogOpen(true);
    };

    const handleOpenDelete = (tmpl: EmailTemplateDto, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setTemplateToDelete(tmpl);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!templateToDelete) return;
        setIsDeleting(true);
        try {
            await deleteEmailTemplate(templateToDelete.id);
            setNotification({
                message: `Template "${templateToDelete.name}" deleted successfully`,
                severity: 'success',
            });
            setDeleteDialogOpen(false);
            setTemplateToDelete(null);
            fetchTemplates();
        } catch (err: any) {
            setNotification({
                message: err.response?.data?.message || 'Failed to delete email template',
                severity: 'error',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredTemplates = useMemo(() => {
        if (!searchQuery.trim()) return templates;
        const q = searchQuery.toLowerCase();
        return templates.filter(
            (t) =>
                t.name.toLowerCase().includes(q) ||
                t.subject.toLowerCase().includes(q) ||
                t.htmlContent.toLowerCase().includes(q)
        );
    }, [templates, searchQuery]);

    const totalFormsLinked = useMemo(() => {
        return templates.reduce((acc, curr) => acc + (curr.formsCount || 0), 0);
    }, [templates]);

    return (
        <Stack spacing={2.5}>
            {/* Header with Title & Action */}
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
                        <Email sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            Email Templates
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8125rem' }}>
                        Manage reusable email notifications and layouts for forms and system messages in this website.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Tooltip title="Refresh list">
                        <IconButton
                            size="small"
                            onClick={fetchTemplates}
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
                            New Template
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
                        <MarkEmailRead sx={{ color: 'text.secondary', fontSize: 24 }} />
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            >
                                EMAIL TEMPLATES
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {templates.length}
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
                        <AssignmentOutlined sx={{ color: 'text.secondary', fontSize: 24 }} />
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            >
                                ASSOCIATED FORMS
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {totalFormsLinked}
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
                        <DynamicFeed sx={{ color: 'text.secondary', fontSize: 24 }} />
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            >
                                DYNAMIC VARIABLES
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: 'text.primary', mt: 0.25, fontSize: '0.8125rem' }}
                            >
                                Ready for Form Hooks
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Search Filter */}
            <TextField
                placeholder="Search templates by name, subject, or content..."
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
            ) : filteredTemplates.length === 0 ? (
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
                    <Email sx={{ fontSize: 38, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {searchQuery ? 'No matching templates found' : 'No email templates yet'}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 440, mx: 'auto', mb: 2.5, fontSize: '0.8125rem' }}
                    >
                        {searchQuery
                            ? `No email templates match "${searchQuery}". Try modifying your search query.`
                            : 'Create reusable email templates to send formatted notifications, welcome messages, and receipts.'}
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
                            Create First Template
                        </Button>
                    )}
                </Paper>
            ) : (
                /* Templates Table */
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
                                    SUBJECT
                                </TableCell>
                                <TableCell
                                    align="center"
                                    sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1.5 }}
                                >
                                    FORMS
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
                            {filteredTemplates.map((tmpl) => (
                                <TableRow
                                    key={tmpl.id}
                                    hover
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleOpenPreview(tmpl)}
                                >
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {tmpl.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                maxWidth: 320,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                fontFamily: 'monospace',
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {tmpl.subject}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Chip
                                            label={`${tmpl.formsCount || 0} forms`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem', height: 22 }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(tmpl.updatedAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1.5, pr: 2 }} onClick={(e) => e.stopPropagation()}>
                                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                                            <Tooltip title="Preview HTML Template">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleOpenPreview(tmpl, e)}
                                                >
                                                    <Visibility fontSize="small" sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                            {canUpdate && (
                                                <Tooltip title="Edit Template">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleOpenEdit(tmpl, e)}
                                                    >
                                                        <Edit fontSize="small" sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {canDelete && (
                                                <Tooltip title="Delete Template">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={(e) => handleOpenDelete(tmpl, e)}
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
            <EmailTemplateFormDialog
                open={formDialogOpen}
                websiteId={websiteId}
                websiteName={websiteName}
                template={selectedTemplate}
                onClose={() => setFormDialogOpen(false)}
                onSuccess={(saved) => {
                    setNotification({
                        message: selectedTemplate
                            ? `Template "${saved.name}" updated successfully`
                            : `Template "${saved.name}" created successfully`,
                        severity: 'success',
                    });
                    fetchTemplates();
                }}
            />

            {/* Quick Preview Dialog */}
            <EmailTemplatePreviewDialog
                open={previewDialogOpen}
                template={previewTemplate}
                websiteName={websiteName}
                onClose={() => {
                    setPreviewDialogOpen(false);
                    setPreviewTemplate(null);
                }}
                onEdit={
                    canUpdate
                        ? (tmpl) => {
                              setSelectedTemplate(tmpl);
                              setFormDialogOpen(true);
                          }
                        : undefined
                }
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Email Template"
                description={`Are you sure you want to permanently delete "${templateToDelete?.name}"? Any forms associated with this template will have their template link cleared.`}
                confirmText="Delete Template"
                confirmColor="error"
                isLoading={isDeleting}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setTemplateToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </Stack>
    );
};

export default EmailTemplatesTab;
