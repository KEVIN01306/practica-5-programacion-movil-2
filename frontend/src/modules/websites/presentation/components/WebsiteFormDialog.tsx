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
    Box,
    Typography,
    FormControlLabel,
    Switch,
    IconButton,
    Alert,
    CircularProgress,
    Stack,
} from '@mui/material';
import { Close, Language, Dns, Storage, Notes } from '@mui/icons-material';
import {
    WebsiteFormSchema,
    type WebsiteFormValues,
} from '../../infrastructure/schemas/website.schema';
import {
    createWebsite,
    updateWebsite,
} from '../../infrastructure/services/websites.service';
import type { WebsiteDto } from '../../domain/dto/websites.dto';

interface WebsiteFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    website?: WebsiteDto | null;
}

export const WebsiteFormDialog: React.FC<WebsiteFormDialogProps> = ({
    open,
    onClose,
    onSuccess,
    website,
}) => {
    const isEdit = Boolean(website);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<WebsiteFormValues>({
        resolver: zodResolver(WebsiteFormSchema),
        defaultValues: {
            name: '',
            domain: '',
            hostingProvider: '',
            hostingNotes: '',
            isActive: true,
            ownerId: null,
        },
    });

    useEffect(() => {
        if (open) {
            setServerError(null);
            if (website) {
                reset({
                    name: website.name,
                    domain: website.domain,
                    hostingProvider: website.hostingProvider || '',
                    hostingNotes: website.hostingNotes || '',
                    isActive: website.isActive,
                    ownerId: website.ownerId,
                });
            } else {
                reset({
                    name: '',
                    domain: '',
                    hostingProvider: '',
                    hostingNotes: '',
                    isActive: true,
                    ownerId: null,
                });
            }
        }
    }, [open, website, reset]);

    const onSubmit = async (data: WebsiteFormValues) => {
        setServerError(null);
        try {
            if (isEdit && website) {
                await updateWebsite(website.id, {
                    name: data.name,
                    domain: data.domain,
                    hostingProvider: data.hostingProvider || null,
                    hostingNotes: data.hostingNotes || null,
                    isActive: data.isActive,
                    ownerId: data.ownerId,
                });
            } else {
                await createWebsite({
                    name: data.name,
                    domain: data.domain,
                    hostingProvider: data.hostingProvider || undefined,
                    hostingNotes: data.hostingNotes || undefined,
                    isActive: data.isActive,
                    ownerId: data.ownerId || undefined,
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                err.message ||
                'An error occurred while saving the website';
            setServerError(message);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={isSubmitting ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 2,
                        p: 0.5,
                    },
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Language sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                            {isEdit ? 'Edit Website' : 'Register New Website'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {isEdit
                                ? 'Update domain and hosting settings'
                                : 'Configure a new website instance for the platform'}
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

                        {/* Website Name */}
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    size="small"
                                    label="Website Name"
                                    placeholder="e.g. Corporate Portal"
                                    fullWidth
                                    disabled={isSubmitting}
                                    error={Boolean(errors.name)}
                                    helperText={errors.name?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                                                    <Language sx={{ fontSize: 18 }} />
                                                </Box>
                                            ),
                                            sx: { fontSize: '0.8125rem' },
                                        },
                                    }}
                                />
                            )}
                        />

                        {/* Domain */}
                        <Controller
                            name="domain"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    size="small"
                                    label="Domain Name"
                                    placeholder="e.g. portal.example.com"
                                    fullWidth
                                    disabled={isSubmitting}
                                    error={Boolean(errors.domain)}
                                    helperText={errors.domain?.message || 'Unique FQDN without http:// or trailing slashes'}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                                                    <Dns sx={{ fontSize: 18 }} />
                                                </Box>
                                            ),
                                            sx: { fontSize: '0.8125rem' },
                                        },
                                    }}
                                />
                            )}
                        />

                        {/* Hosting Provider */}
                        <Controller
                            name="hostingProvider"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    value={field.value || ''}
                                    size="small"
                                    label="Hosting Provider (Optional)"
                                    placeholder="e.g. AWS, Vercel, Hostinger"
                                    fullWidth
                                    disabled={isSubmitting}
                                    error={Boolean(errors.hostingProvider)}
                                    helperText={errors.hostingProvider?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                                                    <Storage sx={{ fontSize: 18 }} />
                                                </Box>
                                            ),
                                            sx: { fontSize: '0.8125rem' },
                                        },
                                    }}
                                />
                            )}
                        />

                        {/* Hosting Notes */}
                        <Controller
                            name="hostingNotes"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    value={field.value || ''}
                                    size="small"
                                    label="Hosting & Infrastructure Notes (Optional)"
                                    placeholder="e.g. Deployed on us-east-1, auto-scaling enabled..."
                                    fullWidth
                                    multiline
                                    rows={3}
                                    disabled={isSubmitting}
                                    error={Boolean(errors.hostingNotes)}
                                    helperText={errors.hostingNotes?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <Box sx={{ mr: 1, mt: 0.75, color: 'text.secondary', alignSelf: 'flex-start', display: 'flex' }}>
                                                    <Notes sx={{ fontSize: 18 }} />
                                                </Box>
                                            ),
                                            sx: { fontSize: '0.8125rem' },
                                        },
                                    }}
                                />
                            )}
                        />

                        {/* Active Status */}
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'action.hover',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                            Website Active Status
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Active websites accept incoming API requests
                                        </Typography>
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={Boolean(field.value)}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                disabled={isSubmitting}
                                                color="primary"
                                            />
                                        }
                                        label=""
                                        sx={{ m: 0 }}
                                    />
                                </Box>
                            )}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 1.25 }}>
                    <Button
                        size="small"
                        onClick={onClose}
                        disabled={isSubmitting}
                        color="inherit"
                        sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8125rem' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="small"
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{ textTransform: 'none', borderRadius: 1.5, px: 2, fontWeight: 600, fontSize: '0.8125rem' }}
                        startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {isEdit ? 'Save Changes' : 'Create Website'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default WebsiteFormDialog;
