import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
    InputAdornment,
    IconButton,
} from '@mui/material';
import { ViewStream, Tag, Description, Close } from '@mui/icons-material';
import {
    contentTypeSchema,
    type ContentTypeFormData,
} from '../../infrastructure/schemas/content-type.schema';
import {
    createContentType,
    updateContentType,
} from '../../infrastructure/services/content-types.service';
import type { ContentTypeDto } from '../../domain/dto/content-types.dto';

interface ContentTypeFormDialogProps {
    open: boolean;
    websiteId: string;
    contentType?: ContentTypeDto | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const ContentTypeFormDialog: React.FC<ContentTypeFormDialogProps> = ({
    open,
    websiteId,
    contentType,
    onClose,
    onSuccess,
}) => {
    const isEdit = Boolean(contentType);
    const [serverError, setServerError] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ContentTypeFormData>({
        resolver: zodResolver(contentTypeSchema),
        defaultValues: {
            name: '',
            slug: '',
            description: '',
        },
    });

    const nameValue = watch('name');

    // Auto-generate slug when name changes (only in create mode if user hasn't manually edited slug)
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue('name', val, { shouldValidate: true });
        if (!isEdit) {
            const generatedSlug = val
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setValue('slug', generatedSlug, { shouldValidate: true });
        }
    };

    useEffect(() => {
        if (open) {
            setServerError(null);
            if (contentType) {
                reset({
                    name: contentType.name,
                    slug: contentType.slug,
                    description: contentType.description || '',
                });
            } else {
                reset({
                    name: '',
                    slug: '',
                    description: '',
                });
            }
        }
    }, [open, contentType, reset]);

    const onSubmit = async (data: ContentTypeFormData) => {
        setServerError(null);
        try {
            if (isEdit && contentType) {
                // If editing and no changes were made, close immediately
                if (!isDirty) {
                    onClose();
                    return;
                }
                await updateContentType(contentType.id, {
                    name: data.name,
                    slug: data.slug,
                    description: data.description || null,
                });
            } else {
                await createContentType({
                    websiteId,
                    name: data.name,
                    slug: data.slug,
                    description: data.description || null,
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                err.message ||
                'An error occurred while saving the content type';
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
                    sx: { borderRadius: 2, p: 0.5 },
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <ViewStream sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                            {isEdit ? 'Edit Content Type' : 'New Content Type'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {isEdit
                                ? 'Update the content type definition and metadata'
                                : 'Define a new dynamic resource (e.g. Products, Posts, Services)'}
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

                        {/* Name */}
                        <TextField
                            size="small"
                            label="Content Type Name"
                            placeholder="e.g. Products, Blog Posts, Services"
                            fullWidth
                            required
                            error={Boolean(errors.name)}
                            helperText={errors.name?.message}
                            value={nameValue || ''}
                            onChange={handleNameChange}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ViewStream sx={{ color: 'text.secondary', fontSize: 18 }} />
                                        </InputAdornment>
                                    ),
                                    sx: { fontSize: '0.8125rem' },
                                },
                            }}
                        />

                        {/* Slug */}
                        <TextField
                            {...register('slug')}
                            size="small"
                            label="Resource Slug"
                            placeholder="e.g. products, blog-posts, services"
                            fullWidth
                            required
                            error={Boolean(errors.slug)}
                            helperText={
                                errors.slug?.message ||
                                'Unique identifier within this website (lowercase, hyphens)'
                            }
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Tag sx={{ color: 'text.secondary', fontSize: 18 }} />
                                        </InputAdornment>
                                    ),
                                    sx: { fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem' },
                                },
                            }}
                        />

                        {/* Description */}
                        <TextField
                            {...register('description')}
                            size="small"
                            label="Description (Optional)"
                            placeholder="Briefly describe what this content type is used for..."
                            fullWidth
                            multiline
                            rows={3}
                            error={Boolean(errors.description)}
                            helperText={errors.description?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 0.75 }}>
                                            <Description sx={{ color: 'text.secondary', fontSize: 18 }} />
                                        </InputAdornment>
                                    ),
                                    sx: { fontSize: '0.8125rem' },
                                },
                            }}
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
                        startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{ textTransform: 'none', borderRadius: 1.5, px: 2, fontWeight: 600, fontSize: '0.8125rem' }}
                    >
                        {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Content Type'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ContentTypeFormDialog;
