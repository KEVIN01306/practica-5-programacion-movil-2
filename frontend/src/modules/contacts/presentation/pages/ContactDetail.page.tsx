import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Card,
    CardContent,
    Divider,
    Avatar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from '@mui/material';
import {
    ArrowBack,
    Person,
    Email,
    Phone,
    Language,
    CalendarMonth,
    Edit,
    Delete,
    Refresh,
    ExpandMore,
    DynamicForm,
    Schedule,
    CheckCircle,
    ReportProblem,
    ErrorOutlined,
    Message,
    Send,
} from '@mui/icons-material';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import ContactFormDialog from '../components/ContactFormDialog';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import {
    getContactById,
    deleteContact,
} from '../../infrastructure/services/contacts.service';
import type { ContactDto, ContactStatusDto } from '../../domain/dto/contacts.dto';

const STATUS_COLOR_MAP: Record<ContactStatusDto, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    LEAD: 'info',
    ACTIVE: 'success',
    UNSUBSCRIBED: 'warning',
    ARCHIVED: 'default',
};

const SUBMISSION_STATUS_ICONS: Record<string, React.ReactElement> = {
    PENDING: <Schedule sx={{ fontSize: 12 }} />,
    PROCESSED: <CheckCircle sx={{ fontSize: 12 }} />,
    SPAM: <ReportProblem sx={{ fontSize: 12 }} />,
    FAILED: <ErrorOutlined sx={{ fontSize: 12 }} />,
};

export const ContactDetailPage: React.FC = () => {
    const { contactId } = useParams<{ contactId: string }>();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const canUpdate = hasPermission(user, 'contacts:update');
    const canDelete = hasPermission(user, 'contacts:delete');

    const [contact, setContact] = useState<ContactDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialogs
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Feedback
    const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const loadContact = useCallback(async () => {
        if (!contactId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await getContactById(contactId);
            setContact(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error loading contact details');
        } finally {
            setLoading(false);
        }
    }, [contactId]);

    useEffect(() => {
        loadContact();
    }, [loadContact]);

    const handleDelete = async () => {
        if (!contactId) return;
        try {
            setIsDeleting(true);
            await deleteContact(contactId);
            setFeedback({ open: true, message: 'Contact deleted successfully', severity: 'success' });
            navigate('/contacts', { replace: true });
        } catch (err: any) {
            setFeedback({
                open: true,
                message: err.response?.data?.message || 'Failed to delete contact',
                severity: 'error',
            });
        } finally {
            setIsDeleting(false);
            setIsDeleteOpen(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 350 }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    if (error || !contact) {
        return (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Button
                    size="small"
                    startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
                    onClick={() => navigate('/contacts')}
                    sx={{ mb: 2, textTransform: 'none', fontSize: '0.8125rem' }}
                >
                    Back to Contacts
                </Button>
                <Alert severity="error" sx={{ fontSize: '0.8125rem' }}>{error || 'Contact not found'}</Alert>
            </Box>
        );
    }

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact';
    const submissions = contact.submissions || [];

    // Extract any prominent message fields from payload if present
    const extractMessage = (data: Record<string, any>) => {
        if (!data || typeof data !== 'object') return null;
        const msgKeys = ['message', 'mensaje', 'comments', 'comentarios', 'inquiry', 'nota', 'notes', 'body'];
        for (const key of msgKeys) {
            if (data[key] && typeof data[key] === 'string') {
                return { key, value: data[key] };
            }
        }
        return null;
    };

    return (
        <Box sx={{ p: { xs: 1.5, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* ── Top Bar (Header + Actions) ─────────────────────────── */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: 2,
                    }}
                >
                    {/* Left: Avatar & Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <Tooltip title="Back to Contacts">
                            <IconButton
                                size="small"
                                onClick={() => navigate('/contacts')}
                                sx={{
                                    border: 1,
                                    borderColor: 'divider',
                                    p: 0.75,
                                    borderRadius: 1.5,
                                }}
                            >
                                <ArrowBack sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>

                        <Avatar
                            sx={{
                                width: { xs: 40, sm: 44 },
                                height: { xs: 40, sm: 44 },
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                fontWeight: 700,
                                fontSize: '0.9375rem',
                                flexShrink: 0,
                            }}
                        >
                            {(contact.firstName?.[0] || contact.email?.[0] || 'C').toUpperCase()}
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
                                        lineHeight: 1.2,
                                    }}
                                    noWrap
                                >
                                    {fullName}
                                </Typography>
                                <Chip
                                    label={contact.status}
                                    color={STATUS_COLOR_MAP[contact.status]}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.6875rem',
                                        height: 20,
                                    }}
                                />
                            </Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mt: 0.25,
                                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                    wordBreak: 'break-all',
                                }}
                            >
                                <Email sx={{ fontSize: 14, flexShrink: 0 }} /> {contact.email}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right: Action Buttons */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                        }}
                    >
                        <Tooltip title="Reload Contact">
                            <IconButton
                                size="small"
                                onClick={loadContact}
                                color="inherit"
                                sx={{ border: 1, borderColor: 'divider', p: 0.75, borderRadius: 1.5 }}
                            >
                                <Refresh sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>

                        {canUpdate && (
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Edit sx={{ fontSize: 15 }} />}
                                onClick={() => setIsEditOpen(true)}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    borderRadius: 1.5,
                                    py: 0.5,
                                    px: 1.5,
                                }}
                            >
                                Edit
                            </Button>
                        )}

                        {canDelete && (
                            <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Delete sx={{ fontSize: 15 }} />}
                                onClick={() => setIsDeleteOpen(true)}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    borderRadius: 1.5,
                                    py: 0.5,
                                    px: 1.5,
                                }}
                            >
                                Delete
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* ── Summary / KPI Cards (Responsive & Desaturated) ───────── */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 1.5,
                }}
            >
                <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar
                                sx={{
                                    bgcolor: 'action.hover',
                                    color: 'text.secondary',
                                    width: 34,
                                    height: 34,
                                    borderRadius: 1.5,
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Send sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem', display: 'block' }} noWrap>
                                    Inquiries Sent
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                                    {contact.submissionsCount ?? submissions.length}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar
                                sx={{
                                    bgcolor: 'action.hover',
                                    color: 'text.secondary',
                                    width: 34,
                                    height: 34,
                                    borderRadius: 1.5,
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Language sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem', display: 'block' }} noWrap>
                                    Website Origin
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.2 }} noWrap>
                                    {contact.website?.name || '—'}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar
                                sx={{
                                    bgcolor: 'action.hover',
                                    color: 'text.secondary',
                                    width: 34,
                                    height: 34,
                                    borderRadius: 1.5,
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Phone sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem', display: 'block' }} noWrap>
                                    Phone Number
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.2 }} noWrap>
                                    {contact.phone || '—'}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar
                                sx={{
                                    bgcolor: 'action.hover',
                                    color: 'text.secondary',
                                    width: 34,
                                    height: 34,
                                    borderRadius: 1.5,
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <CalendarMonth sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem', display: 'block' }} noWrap>
                                    Registered On
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.2 }} noWrap>
                                    {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '—'}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* ── Main Details Grid ──────────────────────────────────── */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
                    gap: 2,
                    alignItems: 'start',
                }}
            >
                {/* Left: Contact Info */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 2.5 },
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            mb: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Person sx={{ fontSize: 17, color: 'text.secondary' }} /> Contact Profile
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.6875rem', display: 'block' }}>
                                FULL NAME
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.primary', fontWeight: 500 }}>
                                {fullName}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.6875rem', display: 'block' }}>
                                EMAIL
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.primary', wordBreak: 'break-all' }}>
                                {contact.email}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.6875rem', display: 'block' }}>
                                PHONE
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: contact.phone ? 'text.primary' : 'text.disabled' }}>
                                {contact.phone || 'Not registered'}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.6875rem', display: 'block' }}>
                                COMPANY
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: contact.company ? 'text.primary' : 'text.disabled' }}>
                                {contact.company || 'Not registered'}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.6875rem', display: 'block' }}>
                                ORIGIN WEBSITE
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.primary' }}>
                                {contact.website?.name} {contact.website?.domain ? `(${contact.website.domain})` : ''}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.6875rem', display: 'block' }}>
                                STATUS
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                                <Chip
                                    label={contact.status}
                                    color={STATUS_COLOR_MAP[contact.status]}
                                    size="small"
                                    sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600 }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.6875rem', display: 'block' }}>
                                LAST MODIFIED
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                {contact.updatedAt ? new Date(contact.updatedAt).toLocaleString() : '—'}
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>

                {/* Right: Submissions & Form Messages Timeline */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 2.5 },
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Message sx={{ fontSize: 17, color: 'text.secondary' }} /> Submissions & Inquiries ({submissions.length})
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                Messages and data received from web forms
                            </Typography>
                        </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {submissions.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <DynamicForm sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>
                                No submissions recorded
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                This contact hasn't submitted any forms yet or was created manually.
                            </Typography>
                        </Box>
                    ) : (
                        <Stack spacing={1.5}>
                            {submissions.map((sub, idx) => {
                                const prominentMsg = extractMessage(sub.data);
                                return (
                                    <Accordion
                                        key={sub.id}
                                        defaultExpanded={idx === 0}
                                        variant="outlined"
                                        sx={{
                                            borderRadius: '8px !important',
                                            '&:before': { display: 'none' },
                                            overflow: 'hidden',
                                            border: 1,
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMore sx={{ fontSize: 18 }} />} sx={{ px: 2, py: 0.5 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                    justifyContent: 'space-between',
                                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                                    width: '100%',
                                                    pr: 1.5,
                                                    gap: 0.75,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <DynamicForm sx={{ fontSize: 17, color: 'primary.main' }} />
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.2 }}>
                                                            {sub.form?.name || sub.formName || 'Form Submission'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                                                            Slug: {sub.form?.slug || sub.formSlug || '—'}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip
                                                        icon={SUBMISSION_STATUS_ICONS[sub.status] || undefined}
                                                        label={sub.status}
                                                        size="small"
                                                        color={
                                                            sub.status === 'PROCESSED'
                                                                ? 'success'
                                                                : sub.status === 'PENDING'
                                                                ? 'info'
                                                                : sub.status === 'SPAM'
                                                                ? 'warning'
                                                                : 'error'
                                                        }
                                                        sx={{ fontWeight: 600, fontSize: '0.6875rem', height: 20 }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                                                        {new Date(sub.createdAt).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </AccordionSummary>

                                        <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
                                            <Divider sx={{ mb: 1.5 }} />

                                            {/* Highlighted message note */}
                                            {prominentMsg && (
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 1.5,
                                                        mb: 1.5,
                                                        bgcolor: 'action.hover',
                                                        borderLeft: 3,
                                                        borderColor: 'primary.main',
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            textTransform: 'uppercase',
                                                            fontWeight: 700,
                                                            fontSize: '0.6875rem',
                                                            letterSpacing: 0.5,
                                                        }}
                                                    >
                                                        Submitted Message ({prominentMsg.key})
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            whiteSpace: 'pre-wrap',
                                                            mt: 0.5,
                                                            fontSize: '0.8125rem',
                                                            fontStyle: 'italic',
                                                            color: 'text.primary',
                                                        }}
                                                    >
                                                        "{prominentMsg.value}"
                                                    </Typography>
                                                </Paper>
                                            )}

                                            {/* Submitted Fields Payload Table */}
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    textTransform: 'uppercase',
                                                    fontWeight: 700,
                                                    fontSize: '0.6875rem',
                                                    mb: 0.75,
                                                    display: 'block',
                                                }}
                                            >
                                                All Form Fields
                                            </Typography>

                                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                                                <Table size="small">
                                                    <TableBody>
                                                        {Object.entries(sub.data || {}).map(([key, val]) => (
                                                            <TableRow key={key}>
                                                                <TableCell
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        width: { xs: '40%', sm: '30%' },
                                                                        color: 'text.secondary',
                                                                        bgcolor: 'action.hover',
                                                                        fontSize: '0.75rem',
                                                                        py: 0.75,
                                                                    }}
                                                                >
                                                                    {key}
                                                                </TableCell>
                                                                <TableCell
                                                                    sx={{
                                                                        wordBreak: 'break-word',
                                                                        fontSize: '0.75rem',
                                                                        py: 0.75,
                                                                    }}
                                                                >
                                                                    {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>

                                            {(sub.ipAddress || sub.userAgent) && (
                                                <Box sx={{ display: 'flex', gap: 2, mt: 1.25, flexWrap: 'wrap' }}>
                                                    {sub.ipAddress && (
                                                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6875rem' }}>
                                                            IP: {sub.ipAddress}
                                                        </Typography>
                                                    )}
                                                    {sub.userAgent && (
                                                        <Typography variant="caption" color="text.disabled" noWrap sx={{ maxWidth: 350, fontSize: '0.6875rem' }}>
                                                            UA: {sub.userAgent}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}
                        </Stack>
                    )}
                </Paper>
            </Box>

            {/* ── Dialogs ────────────────────────────────────────────── */}
            {isEditOpen && contact && (
                <ContactFormDialog
                    open={isEditOpen}
                    contact={contact}
                    onClose={() => setIsEditOpen(false)}
                    onSuccess={(updated) => {
                        setContact((prev) => (prev ? { ...prev, ...updated } : updated));
                        setIsEditOpen(false);
                        setFeedback({ open: true, message: 'Contact updated successfully', severity: 'success' });
                    }}
                />
            )}

            <ConfirmDialog
                open={isDeleteOpen}
                title="Delete Contact"
                description={`Are you sure you want to delete contact "${fullName}" (${contact.email})? This action cannot be undone.`}
                confirmText="Delete"
                confirmColor="error"
                isLoading={isDeleting}
                onConfirm={handleDelete}
                onClose={() => setIsDeleteOpen(false)}
            />

            {/* ── Feedback Snackbar ───────────────────────────────────── */}
            <Snackbar
                open={feedback.open}
                autoHideDuration={4000}
                onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
                    severity={feedback.severity}
                    variant="filled"
                    sx={{ width: '100%', fontSize: '0.8125rem' }}
                >
                    {feedback.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ContactDetailPage;
