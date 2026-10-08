import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Switch,
    Chip,
    IconButton,
    MenuItem,
    InputAdornment,
    Paper,
    type Theme,
} from '@mui/material';
import {
    Close,
    DynamicForm,
    Add,
    Email,
    MarkEmailRead,
    NotificationsActive,
    AlternateEmail,
} from '@mui/icons-material';
import {
    FormFormSchema,
    type FormFormData,
} from '../../infrastructure/schemas/form.schema';
import { createForm, updateForm } from '../../infrastructure/services/forms.service';
import { getEmailTemplatesByWebsite } from '../../infrastructure/services/email-templates.service';
import type { FormDto } from '../../domain/dto/forms.dto';
import type { EmailTemplateDto } from '../../domain/dto/email-templates.dto';

interface FormFormDialogProps {
    open: boolean;
    websiteId: string;
    websiteDomain?: string;
    form?: FormDto | null;
    onClose: () => void;
    onSuccess: (savedForm: FormDto) => void;
}

export const FormFormDialog: React.FC<FormFormDialogProps> = ({
    open,
    websiteId,
    websiteDomain,
    form,
    onClose,
    onSuccess,
}) => {
    const isEdit = Boolean(form);
    const [serverError, setServerError] = useState<string | null>(null);
    const [recipientInput, setRecipientInput] = useState('');
    const [recipientInputError, setRecipientInputError] = useState<string | null>(null);
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplateDto[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormFormData>({
        resolver: zodResolver(FormFormSchema),
        defaultValues: {
            name: '',
            slug: '',
            sendEmail: false,
            emailFromUser: 'notifications',
            recipientEmails: [],
            emailTemplateId: null,
        },
    });

    const watchedSendEmail = watch('sendEmail');
    const watchedRecipients = watch('recipientEmails') || [];

    // Fetch email templates for website
    useEffect(() => {
        if (open && websiteId) {
            setLoadingTemplates(true);
            getEmailTemplatesByWebsite(websiteId, { limit: 100 })
                .then((res) => setEmailTemplates(res.data))
                .catch(() => setEmailTemplates([]))
                .finally(() => setLoadingTemplates(false));
        }
    }, [open, websiteId]);

    useEffect(() => {
        if (open) {
            setServerError(null);
            setRecipientInput('');
            setRecipientInputError(null);
            if (form) {
                const initialUser = form.emailFrom ? form.emailFrom.split('@')[0] : 'notifications';
                reset({
                    name: form.name,
                    slug: form.slug,
                    sendEmail: form.sendEmail,
                    emailFromUser: initialUser,
                    recipientEmails: form.recipientEmails || [],
                    emailTemplateId: form.emailTemplateId || null,
                });
            } else {
                reset({
                    name: '',
                    slug: '',
                    sendEmail: false,
                    emailFromUser: 'notifications',
                    recipientEmails: [],
                    emailTemplateId: null,
                });
            }
        }
    }, [open, form, reset]);

    // Auto-generate slug from name on create
    const handleNameChange = (val: string) => {
        setValue('name', val, { shouldValidate: true });
        if (!isEdit) {
            const generatedSlug = val
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setValue('slug', generatedSlug, { shouldValidate: true });
        }
    };

    const handleAddRecipient = () => {
        const email = recipientInput.trim().toLowerCase();
        if (!email) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setRecipientInputError('Please enter a valid email address');
            return;
        }

        if (watchedRecipients.includes(email)) {
            setRecipientInputError('This email is already added');
            return;
        }

        const updated = [...watchedRecipients, email];
        setValue('recipientEmails', updated, { shouldValidate: true });
        setRecipientInput('');
        setRecipientInputError(null);
    };

    const handleRemoveRecipient = (emailToRemove: string) => {
        const updated = watchedRecipients.filter((e) => e !== emailToRemove);
        setValue('recipientEmails', updated, { shouldValidate: true });
    };

    const handleRecipientKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddRecipient();
        }
    };

    const onSubmit = async (data: FormFormData) => {
        setServerError(null);
        try {
            const senderUser = (data.emailFromUser || 'notifications').trim().toLowerCase();
            const formattedEmailFrom = data.sendEmail
                ? (websiteDomain ? `${senderUser}@${websiteDomain.trim().toLowerCase()}` : senderUser)
                : null;

            if (isEdit && form) {
                const updated = await updateForm(form.id, {
                    name: data.name,
                    slug: data.slug,
                    sendEmail: data.sendEmail,
                    emailFrom: formattedEmailFrom,
                    recipientEmails: data.sendEmail ? data.recipientEmails : null,
                    emailTemplateId: data.sendEmail && data.emailTemplateId ? data.emailTemplateId : null,
                });
                onSuccess(updated);
            } else {
                const created = await createForm(websiteId, {
                    name: data.name,
                    slug: data.slug,
                    sendEmail: data.sendEmail,
                    emailFrom: formattedEmailFrom,
                    recipientEmails: data.sendEmail ? data.recipientEmails : null,
                    emailTemplateId: data.sendEmail && data.emailTemplateId ? data.emailTemplateId : null,
                });
                onSuccess(created);
            }
            onClose();
        } catch (err: any) {
            setServerError(
                err.response?.data?.message || 'An error occurred while saving the form'
            );
        }
    };

    return (
        <Dialog
            open={open}
            onClose={isSubmitting ? undefined : onClose}
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
                    <DynamicForm sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                            {isEdit ? 'Edit Form Configuration' : 'Create New Form'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Configure form endpoints and submission notifications
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} disabled={isSubmitting} size="small">
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers sx={{ borderColor: 'divider', p: 2.5 }}>
                    <Stack spacing={2.5}>
                        {serverError && (
                            <Alert severity="error" sx={{ borderRadius: 1.5, fontSize: '0.8125rem' }}>
                                {serverError}
                            </Alert>
                        )}

                        {/* Name */}
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    label="Form Name"
                                    placeholder="e.g. Main Contact Form"
                                    size="small"
                                    fullWidth
                                    disabled={isSubmitting}
                                    error={Boolean(errors.name)}
                                    helperText={errors.name?.message}
                                />
                            )}
                        />

                        {/* Slug */}
                        <Controller
                            name="slug"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Endpoint Slug"
                                    placeholder="e.g. contact-form"
                                    size="small"
                                    fullWidth
                                    disabled={isSubmitting}
                                    error={Boolean(errors.slug)}
                                    helperText={
                                        errors.slug?.message ||
                                        'Used in public endpoint: /api/v1/forms/:slug/submit'
                                    }
                                    slotProps={{
                                        input: {
                                            sx: { fontFamily: 'monospace', fontSize: '0.8125rem' },
                                        },
                                    }}
                                />
                            )}
                        />

                        {/* Email Notifications Switch Section */}
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 1.5,
                                borderColor: 'divider',
                                bgcolor: (theme: Theme) =>
                                    theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                    <NotificationsActive
                                        sx={{
                                            color: watchedSendEmail ? 'primary.main' : 'text.disabled',
                                            fontSize: 20,
                                        }}
                                    />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                            Email Notifications
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Send automated alerts when new submissions arrive
                                        </Typography>
                                    </Box>
                                </Box>

                                <Controller
                                    name="sendEmail"
                                    control={control}
                                    render={({ field }) => (
                                        <Switch
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            disabled={isSubmitting}
                                            size="small"
                                        />
                                    )}
                                />
                            </Box>

                            {/* Expanded Email Configuration */}
                            {watchedSendEmail && (
                                <Stack spacing={2} sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                    {/* Sender (From) User Configuration */}
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
                                            Sender Email (From)
                                        </Typography>
                                        <Controller
                                            name="emailFromUser"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                .toLowerCase()
                                                                .replace(/[^a-z0-9._-]/g, '')
                                                        )
                                                    }
                                                    placeholder="notifications"
                                                    size="small"
                                                    fullWidth
                                                    disabled={isSubmitting}
                                                    error={Boolean(errors.emailFromUser)}
                                                    helperText={
                                                        errors.emailFromUser?.message ||
                                                        `Sender email is locked to @${websiteDomain || 'yourdomain.com'} to guarantee deliverability and avoid spam classification.`
                                                    }
                                                    slotProps={{
                                                        input: {
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <AlternateEmail
                                                                        sx={{
                                                                            fontSize: 18,
                                                                            color: 'text.secondary',
                                                                        }}
                                                                    />
                                                                </InputAdornment>
                                                            ),
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            fontFamily: 'monospace',
                                                                            fontWeight: 600,
                                                                            color: 'primary.main',
                                                                            bgcolor: (theme: Theme) =>
                                                                                theme.palette.mode === 'dark'
                                                                                    ? 'primary.dark'
                                                                                    : 'primary.50',
                                                                            px: 1,
                                                                            py: 0.5,
                                                                            borderRadius: 1,
                                                                            border: 1,
                                                                            borderColor: 'primary.light',
                                                                        }}
                                                                    >
                                                                        @{websiteDomain || 'domain.com'}
                                                                    </Typography>
                                                                </InputAdornment>
                                                            ),
                                                            sx: {
                                                                bgcolor: 'background.paper',
                                                                fontSize: '0.8125rem',
                                                            },
                                                        },
                                                    }}
                                                />
                                            )}
                                        />
                                    </Box>

                                    {/* Recipients Input */}
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
                                            Notification Recipients
                                        </Typography>

                                        <Stack direction="row" spacing={1}>
                                            <TextField
                                                value={recipientInput}
                                                onChange={(e) => {
                                                    setRecipientInput(e.target.value);
                                                    setRecipientInputError(null);
                                                }}
                                                onKeyDown={handleRecipientKeyDown}
                                                placeholder="admin@example.com"
                                                size="small"
                                                fullWidth
                                                error={Boolean(recipientInputError)}
                                                helperText={recipientInputError}
                                                disabled={isSubmitting}
                                                slotProps={{
                                                    input: {
                                                        sx: { fontSize: '0.8125rem', bgcolor: 'background.paper' },
                                                    },
                                                }}
                                            />
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<Add fontSize="small" />}
                                                onClick={handleAddRecipient}
                                                disabled={isSubmitting || !recipientInput.trim()}
                                                sx={{ textTransform: 'none', borderRadius: 1.5, px: 2, fontSize: '0.75rem' }}
                                            >
                                                Add
                                            </Button>
                                        </Stack>

                                        {/* Recipients Chips */}
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
                                            {watchedRecipients.map((email) => (
                                                <Chip
                                                    key={email}
                                                    label={email}
                                                    size="small"
                                                    onDelete={() => handleRemoveRecipient(email)}
                                                    icon={<Email sx={{ fontSize: '13px !important' }} />}
                                                    sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
                                                />
                                            ))}
                                            {watchedRecipients.length === 0 && (
                                                <Typography variant="caption" color="error">
                                                    At least one recipient email address is required
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Email Template Select */}
                                    <Controller
                                        name="emailTemplateId"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(e.target.value || null)}
                                                select
                                                label="Email Template (Optional)"
                                                size="small"
                                                fullWidth
                                                disabled={isSubmitting || loadingTemplates}
                                                helperText="Select a pre-designed email template for automated formatting"
                                                slotProps={{
                                                    input: {
                                                        sx: { bgcolor: 'background.paper', fontSize: '0.8125rem' },
                                                    },
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>Default Plain Notification</em>
                                                </MenuItem>
                                                {emailTemplates.map((t) => (
                                                    <MenuItem key={t.id} value={t.id}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <MarkEmailRead sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                                                                {t.name} ({t.subject})
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                </Stack>
                            )}
                        </Paper>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 1.5, borderColor: 'divider' }}>
                    <Button
                        onClick={onClose}
                        disabled={isSubmitting}
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: 'none', borderRadius: 1.5 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        size="small"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
                        sx={{ textTransform: 'none', borderRadius: 1.5, px: 2 }}
                    >
                        {isEdit ? 'Save Changes' : 'Create Form'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default FormFormDialog;
