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
    Visibility,
    MarkEmailRead,
    Email,
    AssignmentOutlined,
    DynamicFeed,
    Clear,
    Refresh,
} from '@mui/icons-material';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import ListTable, { type Column, type Action } from '../../../../shared/components/tables/ListTable';
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
    websiteDomain?: string;
}

export const EmailTemplatesTab: React.FC<EmailTemplatesTabProps> = ({
    websiteId,
    websiteName,
    websiteDomain,
}) => {
    const user = useAuthStore((state) => state.user);

    const canCreate = hasPermission(user, 'email-templates:create');
    const canUpdate = hasPermission(user, 'email-templates:update');
    const canDelete = hasPermission(user, 'email-templates:delete');

    const [templates, setTemplates] = useState<EmailTemplateDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);

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

    const handleOpenEdit = (tmpl: EmailTemplateDto) => {
        setSelectedTemplate(tmpl);
        setFormDialogOpen(true);
    };

    const handleOpenPreview = (tmpl: EmailTemplateDto) => {
        setPreviewTemplate(tmpl);
        setPreviewDialogOpen(true);
    };

    const handleOpenDelete = (tmpl: EmailTemplateDto) => {
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

    const paginatedTemplates = useMemo(() => {
        return filteredTemplates.slice(page * limit, (page + 1) * limit);
    }, [filteredTemplates, page, limit]);

    const totalFormsLinked = useMemo(() => {
        return templates.reduce((acc, curr) => acc + (curr.formsCount || 0), 0);
    }, [templates]);

    const columns: Column[] = useMemo(
        () => [
            {
                id: 'name',
                name: 'Template Name',
                format: (_val: unknown, row: EmailTemplateDto) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Email sx={{ color: 'primary.main', fontSize: 18 }} />
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
                                onClick={() => handleOpenPreview(row)}
                            >
                                {row.name}
                            </Typography>
                        </Box>
                    </Box>
                ),
            },
            {
                id: 'subject',
                name: 'Email Subject',
                format: (val: string) => (
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
                        {val}
                    </Typography>
                ),
            },
            {
                id: 'formsCount',
                name: 'Associated Forms',
                format: (val: number) => (
                    <Chip
                        label={`${val || 0} forms`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                ),
            },
            {
                id: 'updatedAt',
                name: 'Last Updated',
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
                name: 'Preview Template',
                icon: <Visibility sx={{ fontSize: 16 }} />,
                color: 'primary',
                onClick: (row: EmailTemplateDto) => handleOpenPreview(row),
            },
            ...(canUpdate
                ? [
                      {
                          name: 'Edit Template',
                          icon: <Edit sx={{ fontSize: 16 }} />,
                          color: '#2563eb',
                          onClick: (row: EmailTemplateDto) => handleOpenEdit(row),
                      },
                  ]
                : []),
            ...(canDelete
                ? [
                      {
                          name: 'Delete Template',
                          icon: <Delete sx={{ fontSize: 16 }} />,
                          color: '#ef4444',
                          onClick: (row: EmailTemplateDto) => handleOpenDelete(row),
                      },
                  ]
                : []),
        ],
        [canUpdate, canDelete]
    );

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
                data={paginatedTemplates}
                actions={actions}
                pagination={{
                    total: filteredTemplates.length,
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
                        ? 'Loading email templates...'
                        : searchQuery
                        ? `No email templates match "${searchQuery}".`
                        : 'No email templates yet. Create your first template to send formatted notifications.'
                }
            />

            {/* Create / Edit Form Dialog */}
            <EmailTemplateFormDialog
                open={formDialogOpen}
                websiteId={websiteId}
                websiteName={websiteName}
                websiteDomain={websiteDomain}
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
                websiteDomain={websiteDomain}
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
