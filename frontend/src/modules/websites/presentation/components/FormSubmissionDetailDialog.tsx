import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Box,
    Typography,
    Chip,
    IconButton,
    Paper,
    Divider,
    MenuItem,
    TextField,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Close,
    Inbox,
    Person,
    CalendarToday,
    Key,
    CheckCircle,
    ErrorOutlined,
    ReportProblem,
    Schedule,
} from '@mui/icons-material';
import type { FormSubmissionDto, SubmissionStatusDto } from '../../domain/dto/forms.dto';
import { updateFormSubmissionStatus } from '../../infrastructure/services/forms.service';

interface FormSubmissionDetailDialogProps {
    open: boolean;
    submission: FormSubmissionDto | null;
    formName: string;
    canUpdateStatus?: boolean;
    onClose: () => void;
    onStatusUpdated?: (updated: FormSubmissionDto) => void;
}

const STATUS_COLORS: Record<
    SubmissionStatusDto,
    { label: string; color: 'warning' | 'success' | 'error' | 'default'; icon: React.ReactElement }
> = {
    PENDING: { label: 'Pending', color: 'warning', icon: <Schedule sx={{ fontSize: 14 }} /> },
    PROCESSED: { label: 'Processed', color: 'success', icon: <CheckCircle sx={{ fontSize: 14 }} /> },
    SPAM: { label: 'Spam', color: 'error', icon: <ReportProblem sx={{ fontSize: 14 }} /> },
    FAILED: { label: 'Failed', color: 'default', icon: <ErrorOutlined sx={{ fontSize: 14 }} /> },
};

export const FormSubmissionDetailDialog: React.FC<FormSubmissionDetailDialogProps> = ({
    open,
    submission,
    formName,
    canUpdateStatus = false,
    onClose,
    onStatusUpdated,
}) => {
    if (!submission) return null;

    const [currentStatus, setCurrentStatus] = useState<SubmissionStatusDto>(submission.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStatusChange = async (newStatus: SubmissionStatusDto) => {
        setIsUpdating(true);
        setError(null);
        try {
            const updated = await updateFormSubmissionStatus(submission.id, newStatus);
            setCurrentStatus(newStatus);
            if (onStatusUpdated) onStatusUpdated(updated);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update submission status');
        } finally {
            setIsUpdating(false);
        }
    };

    const statusConfig = STATUS_COLORS[currentStatus] || STATUS_COLORS.PENDING;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{ paper: { sx: { borderRadius: 2, p: 0.5 } } }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Inbox sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                            Form Submission Details
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Form: {formName}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: 'divider', p: 2.5 }}>
                <Stack spacing={2.5}>
                    {error && (
                        <Alert severity="error" sx={{ borderRadius: 1.5, fontSize: '0.8125rem' }}>
                            {error}
                        </Alert>
                    )}

                    {/* Metadata Card: Status & Date */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 1.5,
                            borderColor: 'divider',
                            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1.5,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday sx={{ color: 'text.secondary', fontSize: 16 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    Received At
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                    {new Date(submission.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {canUpdateStatus ? (
                                <TextField
                                    select
                                    size="small"
                                    value={currentStatus}
                                    onChange={(e) => handleStatusChange(e.target.value as SubmissionStatusDto)}
                                    disabled={isUpdating}
                                    slotProps={{
                                        input: {
                                            sx: { fontSize: '0.75rem', height: 32, bgcolor: 'background.paper' },
                                        },
                                    }}
                                >
                                    <MenuItem value="PENDING">Pending</MenuItem>
                                    <MenuItem value="PROCESSED">Processed</MenuItem>
                                    <MenuItem value="SPAM">Spam</MenuItem>
                                    <MenuItem value="FAILED">Failed</MenuItem>
                                </TextField>
                            ) : (
                                <Chip
                                    icon={statusConfig.icon}
                                    label={statusConfig.label}
                                    size="small"
                                    color={statusConfig.color}
                                    variant="outlined"
                                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                />
                            )}
                            {isUpdating && <CircularProgress size={16} />}
                        </Box>
                    </Paper>

                    {/* Contact Link Card (If resolved) */}
                    {submission.contact && (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 1.5,
                                borderColor: 'primary.light',
                                bgcolor: 'action.hover',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
                                <Person sx={{ color: 'primary.main', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                    Associated CRM Contact
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                {[submission.contact.firstName, submission.contact.lastName].filter(Boolean).join(' ') ||
                                    submission.contact.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                {submission.contact.email} {submission.contact.phone ? `• ${submission.contact.phone}` : ''}
                            </Typography>
                        </Paper>
                    )}

                    {/* Submission Payload Fields */}
                    <Box>
                        <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5, display: 'block', mb: 1 }}
                        >
                            Submission Data Fields
                        </Typography>

                        <Paper variant="outlined" sx={{ borderRadius: 1.5, borderColor: 'divider', overflow: 'hidden' }}>
                            <Stack divider={<Divider />}>
                                {Object.entries(submission.data || {}).map(([key, value]) => {
                                    const isObject = typeof value === 'object' && value !== null;
                                    const isBoolean = typeof value === 'boolean';
                                    const isUrl = typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));

                                    return (
                                        <Box key={key} sx={{ p: 1.75, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <Key sx={{ color: 'text.secondary', fontSize: 14 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'monospace', color: 'text.secondary' }}>
                                                    {key}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ pl: 2.5 }}>
                                                {isObject ? (
                                                    <Box
                                                        component="pre"
                                                        sx={{
                                                            p: 1,
                                                            borderRadius: 1,
                                                            bgcolor: 'action.hover',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.75rem',
                                                            m: 0,
                                                            overflow: 'auto',
                                                        }}
                                                    >
                                                        {JSON.stringify(value, null, 2)}
                                                    </Box>
                                                ) : isBoolean ? (
                                                    <Chip
                                                        label={value ? 'true' : 'false'}
                                                        size="small"
                                                        color={value ? 'success' : 'default'}
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                                                    />
                                                ) : isUrl ? (
                                                    <Typography
                                                        component="a"
                                                        href={value}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        variant="body2"
                                                        sx={{ color: 'primary.main', textDecoration: 'underline', fontSize: '0.8125rem', wordBreak: 'break-all' }}
                                                    >
                                                        {value}
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', wordBreak: 'break-word' }}>
                                                        {String(value)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                })}

                                {Object.keys(submission.data || {}).length === 0 && (
                                    <Box sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Payload was empty
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.5 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FormSubmissionDetailDialog;
