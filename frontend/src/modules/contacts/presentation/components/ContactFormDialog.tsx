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
    IconButton,
    MenuItem,
    Grid,
} from '@mui/material';
import {
    Close,
    Person,
    Email,
    Phone,
    Business,
    Language,
} from '@mui/icons-material';
import {
    ContactFormSchema,
    type ContactFormData,
} from '../../infrastructure/schemas/contact.schema';
import { createContact, updateContact } from '../../infrastructure/services/contacts.service';
import { getWebsitesPaginated } from '../../../websites/infrastructure/services/websites.service';
import type { ContactDto, ContactStatusDto } from '../../domain/dto/contacts.dto';
import type { WebsiteDto } from '../../../websites/domain/dto/websites.dto';

interface ContactFormDialogProps {
    open: boolean;
    contact?: ContactDto | null;
    initialWebsiteId?: string;
    onClose: () => void;
    onSuccess: (savedContact: ContactDto) => void;
}

const STATUS_OPTIONS: { value: ContactStatusDto; label: string }[] = [
    { value: 'LEAD', label: 'Lead / Prospective' },
    { value: 'ACTIVE', label: 'Active Contact' },
    { value: 'UNSUBSCRIBED', label: 'Unsubscribed' },
    { value: 'ARCHIVED', label: 'Archived' },
];

export const ContactFormDialog: React.FC<ContactFormDialogProps> = ({
    open,
    contact,
    initialWebsiteId,
    onClose,
    onSuccess,
}) => {
    const isEdit = Boolean(contact);
    const [serverError, setServerError] = useState<string | null>(null);
    const [websites, setWebsites] = useState<WebsiteDto[]>([]);
    const [loadingWebsites, setLoadingWebsites] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({
        resolver: zodResolver(ContactFormSchema),
        defaultValues: {
            websiteId: initialWebsiteId || '',
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
            company: '',
            status: 'LEAD',
        },
    });

    useEffect(() => {
        if (open) {
            setLoadingWebsites(true);
            getWebsitesPaginated(1, 100)
                .then((res) => setWebsites(res.data))
                .catch(() => setWebsites([]))
                .finally(() => setLoadingWebsites(false));
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            setServerError(null);
            if (contact) {
                reset({
                    websiteId: contact.websiteId,
                    email: contact.email,
                    firstName: contact.firstName || '',
                    lastName: contact.lastName || '',
                    phone: contact.phone || '',
                    company: contact.company || '',
                    status: contact.status,
                });
            } else {
                reset({
                    websiteId: initialWebsiteId || '',
                    email: '',
                    firstName: '',
                    lastName: '',
                    phone: '',
                    company: '',
                    status: 'LEAD',
                });
            }
        }
    }, [open, contact, initialWebsiteId, reset]);

    const onSubmit = async (data: ContactFormData) => {
        setServerError(null);
        try {
            if (isEdit && contact) {
                const updated = await updateContact(contact.id, {
                    firstName: data.firstName || null,
                    lastName: data.lastName || null,
                    phone: data.phone || null,
                    company: data.company || null,
                    status: data.status,
                });
                onSuccess(updated);
            } else {
                const created = await createContact({
                    websiteId: data.websiteId,
                    email: data.email,
                    firstName: data.firstName || null,
                    lastName: data.lastName || null,
                    phone: data.phone || null,
                    company: data.company || null,
                    status: data.status,
                });
                onSuccess(created);
            }
            onClose();
        } catch (err: any) {
            setServerError(
                err.response?.data?.message || 'An error occurred while saving the contact'
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
                    <Person sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                            {isEdit ? 'Edit Contact Details' : 'Create New Contact'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {isEdit
                                ? 'Update personal details and lead status'
                                : 'Add a new contact to your centralized audience directory'}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} disabled={isSubmitting} size="small">
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers sx={{ borderColor: 'divider', p: 2.5 }}>
                    <Stack spacing={2}>
                        {serverError && (
                            <Alert severity="error" sx={{ borderRadius: 1.5, fontSize: '0.8125rem' }}>
                                {serverError}
                            </Alert>
                        )}

                        {/* Associated Website */}
                        {!isEdit && (
                            <Controller
                                name="websiteId"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Associated Website"
                                        size="small"
                                        fullWidth
                                        disabled={isSubmitting || loadingWebsites || Boolean(initialWebsiteId)}
                                        error={Boolean(errors.websiteId)}
                                        helperText={errors.websiteId?.message || 'The website origin for this contact'}
                                    >
                                        <MenuItem value="" disabled>
                                            <em>Select a website...</em>
                                        </MenuItem>
                                        {websites.map((w) => (
                                            <MenuItem key={w.id} value={w.id}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Language sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                                                        {w.name} ({w.domain})
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        )}

                        {/* Email Address */}
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Email Address"
                                    placeholder="contact@example.com"
                                    size="small"
                                    fullWidth
                                    disabled={isSubmitting || isEdit}
                                    error={Boolean(errors.email)}
                                    helperText={errors.email?.message || (isEdit ? 'Email address cannot be modified once created' : undefined)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <Email sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                                            ),
                                        },
                                    }}
                                />
                            )}
                        />

                        {/* Names */}
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={field.value || ''}
                                            label="First Name"
                                            placeholder="John"
                                            size="small"
                                            fullWidth
                                            disabled={isSubmitting}
                                            error={Boolean(errors.firstName)}
                                            helperText={errors.firstName?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={field.value || ''}
                                            label="Last Name"
                                            placeholder="Doe"
                                            size="small"
                                            fullWidth
                                            disabled={isSubmitting}
                                            error={Boolean(errors.lastName)}
                                            helperText={errors.lastName?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        {/* Phone & Company */}
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={field.value || ''}
                                            label="Phone Number"
                                            placeholder="+1 (555) 000-0000"
                                            size="small"
                                            fullWidth
                                            disabled={isSubmitting}
                                            error={Boolean(errors.phone)}
                                            helperText={errors.phone?.message}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <Phone sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                                                    ),
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="company"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={field.value || ''}
                                            label="Company / Organization"
                                            placeholder="Acme Corp"
                                            size="small"
                                            fullWidth
                                            disabled={isSubmitting}
                                            error={Boolean(errors.company)}
                                            helperText={errors.company?.message}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <Business sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                                                    ),
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        {/* Status Select */}
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Contact Status"
                                    size="small"
                                    fullWidth
                                    disabled={isSubmitting}
                                    error={Boolean(errors.status)}
                                    helperText={errors.status?.message}
                                >
                                    {STATUS_OPTIONS.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                                                {opt.label}
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
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
                        {isEdit ? 'Save Changes' : 'Create Contact'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ContactFormDialog;
