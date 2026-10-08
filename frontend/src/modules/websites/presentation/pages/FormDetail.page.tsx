import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
    Snackbar,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    MenuItem,
    Grid,
} from '@mui/material';
import {
    ArrowBack,
    DynamicForm,
    ViewStream,
    Inbox,
    Settings,
    Edit,
    Delete,
    Add,
    Api,
    Search,
    Clear,
    Refresh,
    Visibility,
    NotificationsActive,
    NotificationsOff,
    Email,
    MarkEmailRead,
    AutoAwesome,
    Schedule,
    CheckCircle,
    ReportProblem,
    ErrorOutlined,
} from '@mui/icons-material';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import ListTable, { type Column, type Action } from '../../../../shared/components/tables/ListTable';
import FormFormDialog from '../components/FormFormDialog';
import FormFieldFormDialog from '../components/FormFieldFormDialog';
import FormSubmissionDetailDialog from '../components/FormSubmissionDetailDialog';
import PublicFormApiDocDialog from '../components/PublicFormApiDocDialog';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import {
    getFormById,
    deleteForm,
    getFormFieldsByForm,
    deleteFormField,
    bulkCreateFormFields,
    getFormSubmissions,
    deleteFormSubmission,
} from '../../infrastructure/services/forms.service';
import { getWebsiteById } from '../../infrastructure/services/websites.service';
import type {
    FormDto,
    FormFieldDto,
    FormSubmissionDto,
    SubmissionStatusDto,
} from '../../domain/dto/forms.dto';
import type { WebsiteDto } from '../../domain/dto/websites.dto';

const STATUS_ICONS: Record<SubmissionStatusDto, React.ReactElement> = {
    PENDING: <Schedule sx={{ fontSize: 13 }} />,
    PROCESSED: <CheckCircle sx={{ fontSize: 13 }} />,
    SPAM: <ReportProblem sx={{ fontSize: 13 }} />,
    FAILED: <ErrorOutlined sx={{ fontSize: 13 }} />,
};

export const FormDetailPage: React.FC = () => {
    const { websiteId, formId } = useParams<{ websiteId: string; formId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const canUpdateForm = hasPermission(user, 'forms:update');
    const canDeleteForm = hasPermission(user, 'forms:delete');
    const canCreateField = hasPermission(user, 'form-fields:create');
    const canUpdateField = hasPermission(user, 'form-fields:update');
    const canDeleteField = hasPermission(user, 'form-fields:delete');
    const canUpdateSubmission = hasPermission(user, 'form-submissions:update');
    const canDeleteSubmission = hasPermission(user, 'form-submissions:delete');

    // Tab handling: 0 = Overview, 1 = Fields, 2 = Submissions
    const tabParam = searchParams.get('tab');
    const initialTab = tabParam === 'submissions' ? 2 : tabParam === 'fields' ? 1 : 0;
    const [activeTab, setActiveTab] = useState(initialTab);

    const [form, setForm] = useState<FormDto | null>(null);
    const [website, setWebsite] = useState<WebsiteDto | null>(null);
    const [fields, setFields] = useState<FormFieldDto[]>([]);
    const [submissions, setSubmissions] = useState<FormSubmissionDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters for submissions
    const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>('ALL');
    const [submissionSearch, setSubmissionSearch] = useState('');
    const [submissionPage, setSubmissionPage] = useState(0);
    const [submissionLimit, setSubmissionLimit] = useState(10);

    // Dialogs state
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [deleteFormOpen, setDeleteFormOpen] = useState(false);
    const [apiDocOpen, setApiDocOpen] = useState(false);

    // Fields dialogs
    const [fieldFormOpen, setFieldFormOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<FormFieldDto | null>(null);
    const [deleteFieldOpen, setDeleteFieldOpen] = useState(false);
    const [fieldToDelete, setFieldToDelete] = useState<FormFieldDto | null>(null);

    // Submissions dialogs
    const [submissionDetailOpen, setSubmissionDetailOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<FormSubmissionDto | null>(null);
    const [deleteSubmissionOpen, setDeleteSubmissionOpen] = useState(false);
    const [submissionToDelete, setSubmissionToDelete] = useState<FormSubmissionDto | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);

    // Toast feedback
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const loadData = useCallback(async () => {
        if (!formId || !websiteId) return;
        setLoading(true);
        try {
            const [formData, websiteData, fieldsData, submissionsData] = await Promise.all([
                getFormById(formId),
                getWebsiteById(websiteId),
                getFormFieldsByForm(formId),
                getFormSubmissions(formId, { limit: 100 }),
            ]);
            setForm(formData);
            setWebsite(websiteData);
            setFields(fieldsData);
            setSubmissions(submissionsData.data);
        } catch {
            setSnackbar({
                open: true,
                message: 'Failed to load form details',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [formId, websiteId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        if (newValue === 1) {
            setSearchParams({ tab: 'fields' });
        } else if (newValue === 2) {
            setSearchParams({ tab: 'submissions' });
        } else {
            setSearchParams({});
        }
    };

    // ==========================================
    // Form handlers
    // ==========================================
    const handleConfirmDeleteForm = async () => {
        if (!form || !websiteId) return;
        setIsProcessing(true);
        try {
            await deleteForm(form.id);
            navigate(`/websites/${websiteId}?tab=forms`);
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete form',
                severity: 'error',
            });
            setIsProcessing(false);
        }
    };

    // ==========================================
    // Field handlers
    // ==========================================
    const handleConfirmDeleteField = async () => {
        if (!fieldToDelete) return;
        setIsProcessing(true);
        try {
            await deleteFormField(fieldToDelete.id);
            setSnackbar({
                open: true,
                message: `Field "${fieldToDelete.label}" deleted successfully`,
                severity: 'success',
            });
            setDeleteFieldOpen(false);
            setFieldToDelete(null);
            if (formId) {
                const updatedFields = await getFormFieldsByForm(formId);
                setFields(updatedFields);
            }
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete form field',
                severity: 'error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLoadPresetFields = async () => {
        if (!formId) return;
        setIsProcessing(true);
        try {
            const standardFields = [
                { label: 'Full Name', key: 'name', type: 'STRING' as const, isRequired: true },
                { label: 'Email Address', key: 'email', type: 'STRING' as const, isRequired: true },
                { label: 'Phone Number', key: 'phone', type: 'STRING' as const, isRequired: false },
                { label: 'Message', key: 'message', type: 'TEXT' as const, isRequired: true },
            ];
            await bulkCreateFormFields(formId, standardFields);
            setSnackbar({
                open: true,
                message: 'Standard contact form fields loaded successfully',
                severity: 'success',
            });
            const updatedFields = await getFormFieldsByForm(formId);
            setFields(updatedFields);
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to load preset fields',
                severity: 'error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // ==========================================
    // Submission handlers
    // ==========================================
    const handleConfirmDeleteSubmission = async () => {
        if (!submissionToDelete || !formId) return;
        setIsProcessing(true);
        try {
            await deleteFormSubmission(submissionToDelete.id);
            setSnackbar({
                open: true,
                message: 'Form submission deleted successfully',
                severity: 'success',
            });
            setDeleteSubmissionOpen(false);
            setSubmissionToDelete(null);
            const updated = await getFormSubmissions(formId, { limit: 100 });
            setSubmissions(updated.data);
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete submission',
                severity: 'error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredSubmissions = useMemo(() => {
        let result = submissions;
        if (submissionStatusFilter !== 'ALL') {
            result = result.filter((s) => s.status === submissionStatusFilter);
        }
        if (submissionSearch.trim()) {
            const q = submissionSearch.toLowerCase();
            result = result.filter((s) => {
                const contactMatch =
                    s.contact?.email.toLowerCase().includes(q) ||
                    s.contact?.firstName?.toLowerCase().includes(q) ||
                    s.contact?.lastName?.toLowerCase().includes(q);
                const dataMatch = JSON.stringify(s.data).toLowerCase().includes(q);
                return contactMatch || dataMatch;
            });
        }
        return result;
    }, [submissions, submissionStatusFilter, submissionSearch]);

    const paginatedSubmissions = useMemo(() => {
        return filteredSubmissions.slice(
            submissionPage * submissionLimit,
            (submissionPage + 1) * submissionLimit
        );
    }, [filteredSubmissions, submissionPage, submissionLimit]);

    // ==========================================
    // ListTable Column & Action Definitions
    // ==========================================
    const fieldColumns: Column[] = useMemo(
        () => [
            {
                id: 'label',
                name: 'Label',
                format: (_val: unknown, row: FormFieldDto) => (
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            color: canUpdateField ? 'primary.main' : 'text.primary',
                            cursor: canUpdateField ? 'pointer' : 'default',
                            '&:hover': canUpdateField ? { textDecoration: 'underline' } : undefined,
                        }}
                        onClick={() => {
                            if (canUpdateField) {
                                setSelectedField(row);
                                setFieldFormOpen(true);
                            }
                        }}
                    >
                        {row.label}
                    </Typography>
                ),
            },
            {
                id: 'key',
                name: 'Property Key',
                format: (val: string) => (
                    <Chip
                        label={val}
                        size="small"
                        variant="outlined"
                        sx={{ fontFamily: 'monospace', fontSize: '0.75rem', height: 22 }}
                    />
                ),
            },
            {
                id: 'type',
                name: 'Data Type',
                format: (val: string) => (
                    <Chip
                        label={val}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20, fontWeight: 600 }}
                    />
                ),
            },
            {
                id: 'isRequired',
                name: 'Required',
                format: (val: boolean) =>
                    val ? (
                        <Chip
                            label="Required"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20, fontWeight: 600 }}
                        />
                    ) : (
                        <Typography variant="caption" color="text.secondary">
                            Optional
                        </Typography>
                    ),
            },
        ],
        [canUpdateField]
    );

    const fieldActions: Action[] = useMemo(
        () => [
            ...(canUpdateField
                ? [
                    {
                        name: 'Edit Field',
                        icon: <Edit sx={{ fontSize: 16 }} />,
                        color: '#2563eb',
                        onClick: (fld: FormFieldDto) => {
                            setSelectedField(fld);
                            setFieldFormOpen(true);
                        },
                    },
                ]
                : []),
            ...(canDeleteField
                ? [
                    {
                        name: 'Delete Field',
                        icon: <Delete sx={{ fontSize: 16 }} />,
                        color: '#ef4444',
                        onClick: (fld: FormFieldDto) => {
                            setFieldToDelete(fld);
                            setDeleteFieldOpen(true);
                        },
                    },
                ]
                : []),
        ],
        [canUpdateField, canDeleteField]
    );

    const submissionColumns: Column[] = useMemo(
        () => [
            {
                id: 'status',
                name: 'Status',
                format: (val: SubmissionStatusDto) => {
                    const icon = STATUS_ICONS[val] || <Schedule sx={{ fontSize: 13 }} />;
                    const statusColor =
                        val === 'PROCESSED'
                            ? 'success'
                            : val === 'SPAM'
                                ? 'error'
                                : val === 'PENDING'
                                    ? 'warning'
                                    : 'default';
                    return (
                        <Chip
                            icon={icon}
                            label={val}
                            size="small"
                            color={statusColor}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 22, fontWeight: 600 }}
                        />
                    );
                },
            },
            {
                id: 'contact',
                name: 'Contact',
                format: (_val: unknown, row: FormSubmissionDto) => {
                    if (!row.contact) {
                        return (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                                onClick={() => {
                                    setSelectedSubmission(row);
                                    setSubmissionDetailOpen(true);
                                }}
                            >
                                Anonymous
                            </Typography>
                        );
                    }
                    const name =
                        [row.contact.firstName, row.contact.lastName].filter(Boolean).join(' ') ||
                        row.contact.email;
                    return (
                        <Box
                            sx={{ cursor: 'pointer' }}
                            onClick={() => {
                                setSelectedSubmission(row);
                                setSubmissionDetailOpen(true);
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '0.8125rem',
                                    color: 'primary.main',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                {name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                {row.contact.email}
                            </Typography>
                        </Box>
                    );
                },
            },
            {
                id: 'data',
                name: 'Submission Data Preview',
                format: (_val: unknown, row: FormSubmissionDto) => {
                    const previewText = Object.entries(row.data || {})
                        .slice(0, 3)
                        .map(([k, v]) => `${k}: ${String(v)}`)
                        .join(' • ');
                    return (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                maxWidth: 340,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                            }}
                        >
                            {previewText || '(empty)'}
                        </Typography>
                    );
                },
            },
            {
                id: 'createdAt',
                name: 'Date',
                format: (val: string) => (
                    <Typography variant="caption" color="text.secondary">
                        {new Date(val).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Typography>
                ),
            },
        ],
        []
    );

    const submissionActions: Action[] = useMemo(
        () => [
            {
                name: 'View Submission Payload',
                icon: <Visibility sx={{ fontSize: 16 }} />,
                color: 'primary',
                onClick: (sub: FormSubmissionDto) => {
                    setSelectedSubmission(sub);
                    setSubmissionDetailOpen(true);
                },
            },
            ...(canDeleteSubmission
                ? [
                    {
                        name: 'Delete Submission',
                        icon: <Delete sx={{ fontSize: 16 }} />,
                        color: '#ef4444',
                        onClick: (sub: FormSubmissionDto) => {
                            setSubmissionToDelete(sub);
                            setDeleteSubmissionOpen(true);
                        },
                    },
                ]
                : []),
        ],
        [canDeleteSubmission]
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (!form || !website) {
        return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    Form or website not found
                </Typography>
                <Button
                    size="small"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/websites/${websiteId}?tab=forms`)}
                    sx={{ mt: 2, textTransform: 'none' }}
                >
                    Back to Forms
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            {/* Header with Back Button & Title */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button
                    size="small"
                    startIcon={<ArrowBack fontSize="small" />}
                    onClick={() => navigate(`/websites/${websiteId}?tab=forms`)}
                    color="inherit"
                    sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem' }}
                >
                    Back to Forms
                </Button>
            </Stack>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <DynamicForm sx={{ color: 'primary.main', fontSize: 32 }} />
                    <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                                {form.name}
                            </Typography>
                            <Chip
                                label={`/forms/${form.slug}/submit`}
                                size="small"
                                variant="outlined"
                                sx={{ fontFamily: 'monospace', fontSize: '0.75rem', height: 22 }}
                            />
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}>
                            Website: {website.name} ({website.domain})
                        </Typography>
                    </Box>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Api fontSize="small" />}
                        onClick={() => setApiDocOpen(true)}
                        sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8125rem', px: 1.5 }}
                    >
                        Integration API
                    </Button>
                    {canUpdateForm && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit fontSize="small" />}
                            onClick={() => setEditFormOpen(true)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8125rem', px: 1.5 }}
                        >
                            Edit Settings
                        </Button>
                    )}
                    {canDeleteForm && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Delete fontSize="small" />}
                            onClick={() => setDeleteFormOpen(true)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8125rem', px: 1.5 }}
                        >
                            Delete
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* Navigation Tabs */}
            <Paper
                variant="outlined"
                sx={{
                    mt: 2.5,
                    borderRadius: 2,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        px: { xs: 0.5, sm: 2 },
                        borderBottom: 1,
                        borderColor: 'divider',
                        minHeight: 42,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 42,
                            py: 1,
                            fontSize: '0.8125rem',
                            whiteSpace: 'nowrap',
                        },
                    }}
                >
                    <Tab icon={<Settings sx={{ fontSize: 18 }} />} iconPosition="start" label="Overview & Configuration" />
                    <Tab
                        icon={<ViewStream sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label={`Form Fields (${fields.length})`}
                    />
                    <Tab
                        icon={<Inbox sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label={`Submissions (${submissions.length})`}
                    />
                </Tabs>
            </Paper>

            {/* ====================================================== */}
            {/* Tab 0: Overview & Configuration                        */}
            {/* ====================================================== */}
            {activeTab === 0 && (
                <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                    {/* Public Endpoint Card */}
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Api sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        Public Submission Endpoint
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Send submissions from frontends using POST with <code>x-api-key</code>
                                    </Typography>
                                </Box>
                            </Box>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Api fontSize="small" />}
                                onClick={() => setApiDocOpen(true)}
                                sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem' }}
                            >
                                API Documentation
                            </Button>
                        </Box>

                        <TextField
                            value={`${window.location.origin}/api/v1/forms/${form.slug}/submit`}
                            size="small"
                            fullWidth
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    sx: { fontFamily: 'monospace', fontSize: '0.8125rem', bgcolor: 'action.hover' },
                                },
                            }}
                        />
                    </Paper>

                    {/* Notification Settings Card */}
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                            Email Notification Settings
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    {form.sendEmail ? (
                                        <NotificationsActive color="primary" sx={{ fontSize: 18 }} />
                                    ) : (
                                        <NotificationsOff sx={{ fontSize: 18, color: 'text.disabled' }} />
                                    )}
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                        Status: {form.sendEmail ? 'Notifications Active' : 'Notifications Disabled'}
                                    </Typography>
                                </Box>

                                {form.sendEmail && (
                                    <Box sx={{ mt: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                            SENDER ADDRESS (FROM)
                                        </Typography>
                                        <Chip
                                            label={form.emailFrom || `notifications@${website.domain}`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600 }}
                                        />
                                    </Box>
                                )}

                                <Box sx={{ mt: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                        RECIPIENTS
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                        {(form.recipientEmails || []).map((em) => (
                                            <Chip
                                                key={em}
                                                label={em}
                                                size="small"
                                                icon={<Email sx={{ fontSize: '13px !important' }} />}
                                                sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
                                            />
                                        ))}
                                        {(!form.recipientEmails || form.recipientEmails.length === 0) && (
                                            <Typography variant="caption" color="text.secondary">
                                                No recipient emails configured
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                    LINKED EMAIL TEMPLATE
                                </Typography>
                                {form.emailTemplate ? (
                                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MarkEmailRead sx={{ color: 'primary.main', fontSize: 18 }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                                    {form.emailTemplate.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                    Subject: {form.emailTemplate.subject}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                ) : (
                                    <Typography variant="caption" color="text.secondary">
                                        Default plain notification template
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Paper>
                </Stack>
            )}

            {/* ====================================================== */}
            {/* Tab 1: Form Fields (Schema Builder)                     */}
            {/* ====================================================== */}
            {activeTab === 1 && (
                <Stack spacing={2} sx={{ mt: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Form Schema Fields ({fields.length})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                The public endpoint will strictly validate incoming payloads against these fields
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                            {canCreateField && fields.length === 0 && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<AutoAwesome fontSize="small" />}
                                    onClick={handleLoadPresetFields}
                                    disabled={isProcessing}
                                    sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem' }}
                                >
                                    Load Contact Preset
                                </Button>
                            )}
                            {canCreateField && (
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<Add fontSize="small" />}
                                    onClick={() => {
                                        setSelectedField(null);
                                        setFieldFormOpen(true);
                                    }}
                                    sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8125rem' }}
                                >
                                    Add Field
                                </Button>
                            )}
                        </Stack>
                    </Box>

                    {/* Form Fields ListTable */}
                    <ListTable
                        columns={fieldColumns}
                        data={fields}
                        actions={fieldActions}
                        emptyMessage="No fields configured yet. Add fields such as Name, Email, and Message to define what properties this form accepts."
                    />
                </Stack>
            )}

            {/* ====================================================== */}
            {/* Tab 2: Form Submissions                                */}
            {/* ====================================================== */}
            {activeTab === 2 && (
                <Stack spacing={2} sx={{ mt: 2.5 }}>
                    {/* Filter Bar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                        <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 260 }}>
                            <TextField
                                placeholder="Search submissions by contact, email, or data content..."
                                value={submissionSearch}
                                onChange={(e) => {
                                    setSubmissionSearch(e.target.value);
                                    setSubmissionPage(0);
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
                                        endAdornment: submissionSearch ? (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => { setSubmissionSearch(''); setSubmissionPage(0); }}>
                                                    <Clear fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ) : null,
                                        sx: { borderRadius: 1.5, bgcolor: 'background.paper', fontSize: '0.8125rem' },
                                    },
                                }}
                            />

                            <TextField
                                select
                                size="small"
                                value={submissionStatusFilter}
                                onChange={(e) => {
                                    setSubmissionStatusFilter(e.target.value);
                                    setSubmissionPage(0);
                                }}
                                sx={{ minWidth: 140 }}
                                slotProps={{ input: { sx: { fontSize: '0.8125rem', bgcolor: 'background.paper' } } }}
                            >
                                <MenuItem value="ALL">All Statuses</MenuItem>
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="PROCESSED">Processed</MenuItem>
                                <MenuItem value="SPAM">Spam</MenuItem>
                                <MenuItem value="FAILED">Failed</MenuItem>
                            </TextField>
                        </Stack>

                        <Tooltip title="Refresh submissions">
                            <IconButton
                                size="small"
                                onClick={async () => {
                                    if (formId) {
                                        const res = await getFormSubmissions(formId, { limit: 100 });
                                        setSubmissions(res.data);
                                    }
                                }}
                                sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5 }}
                            >
                                <Refresh fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Submissions ListTable */}
                    <ListTable
                        columns={submissionColumns}
                        data={paginatedSubmissions}
                        actions={submissionActions}
                        pagination={{
                            total: filteredSubmissions.length,
                            limit: submissionLimit,
                            offset: submissionPage * submissionLimit,
                            onPageChange: (newPage: number) => setSubmissionPage(newPage),
                            onRowsPerPageChange: (newLimit: number) => {
                                setSubmissionLimit(newLimit);
                                setSubmissionPage(0);
                            },
                        }}
                        emptyMessage={
                            submissionSearch || submissionStatusFilter !== 'ALL'
                                ? 'No matching submissions found.'
                                : 'No submissions received yet. When external users submit data through the public endpoint, their entries will appear here.'
                        }
                    />
                </Stack>
            )}

            {/* Dialogs */}
            <FormFormDialog
                open={editFormOpen}
                websiteId={website.id}
                websiteDomain={website.domain}
                form={form}
                onClose={() => setEditFormOpen(false)}
                onSuccess={(updated) => {
                    setForm(updated);
                    setSnackbar({ open: true, message: 'Form updated successfully', severity: 'success' });
                }}
            />

            <FormFieldFormDialog
                open={fieldFormOpen}
                formId={form.id}
                field={selectedField}
                onClose={() => setFieldFormOpen(false)}
                onSuccess={async () => {
                    const updated = await getFormFieldsByForm(form.id);
                    setFields(updated);
                    setSnackbar({
                        open: true,
                        message: selectedField ? 'Field updated successfully' : 'Field added successfully',
                        severity: 'success',
                    });
                }}
            />

            <FormSubmissionDetailDialog
                open={submissionDetailOpen}
                submission={selectedSubmission}
                formName={form.name}
                canUpdateStatus={canUpdateSubmission}
                onClose={() => {
                    setSubmissionDetailOpen(false);
                    setSelectedSubmission(null);
                }}
                onStatusUpdated={async () => {
                    const updated = await getFormSubmissions(form.id, { limit: 100 });
                    setSubmissions(updated.data);
                }}
            />

            <PublicFormApiDocDialog
                open={apiDocOpen}
                form={form}
                fields={fields}
                websiteDomain={website.domain}
                apiKey={website.apiKey}
                onClose={() => setApiDocOpen(false)}
            />

            <ConfirmDialog
                open={deleteFormOpen}
                title="Delete Form"
                description={`Are you sure you want to delete form "${form.name}"? This action is permanent and will delete all configured fields and received submissions.`}
                confirmText="Delete Form"
                confirmColor="error"
                isLoading={isProcessing}
                onClose={() => setDeleteFormOpen(false)}
                onConfirm={handleConfirmDeleteForm}
            />

            <ConfirmDialog
                open={deleteFieldOpen}
                title="Delete Form Field"
                description={`Are you sure you want to delete field "${fieldToDelete?.label}" (${fieldToDelete?.key})? Existing submission data will remain intact.`}
                confirmText="Delete Field"
                confirmColor="error"
                isLoading={isProcessing}
                onClose={() => setDeleteFieldOpen(false)}
                onConfirm={handleConfirmDeleteField}
            />

            <ConfirmDialog
                open={deleteSubmissionOpen}
                title="Delete Submission"
                description="Are you sure you want to permanently delete this form submission?"
                confirmText="Delete"
                confirmColor="error"
                isLoading={isProcessing}
                onClose={() => setDeleteSubmissionOpen(false)}
                onConfirm={handleConfirmDeleteSubmission}
            />

            {/* Toast Feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FormDetailPage;
