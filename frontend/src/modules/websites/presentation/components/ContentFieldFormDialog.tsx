import React, { useEffect } from 'react';
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
    InputAdornment,
    MenuItem,
    FormControlLabel,
    Switch,
    Chip,
    IconButton,
} from '@mui/material';
import {
    ShortText,
    Notes,
    Pin,
    ToggleOn,
    Event,
    DataObject,
    Link,
    Code,
    Label,
    Close,
} from '@mui/icons-material';
import {
    contentFieldSchema,
    FIELD_TYPES,
    type ContentFieldFormData,
} from '../../infrastructure/schemas/content-field.schema';
import {
    createContentField,
    updateContentField,
} from '../../infrastructure/services/content-types.service';
import type { ContentFieldDto, FieldType } from '../../domain/dto/content-types.dto';

interface ContentFieldFormDialogProps {
    open: boolean;
    contentTypeId: string;
    field?: ContentFieldDto | null;
    onClose: () => void;
    onSuccess: () => void;
}

const FIELD_TYPE_ICONS: Record<FieldType, React.ReactNode> = {
    STRING: <ShortText sx={{ fontSize: 18 }} />,
    TEXT: <Notes sx={{ fontSize: 18 }} />,
    NUMBER: <Pin sx={{ fontSize: 18 }} />,
    BOOLEAN: <ToggleOn sx={{ fontSize: 18 }} />,
    DATE: <Event sx={{ fontSize: 18 }} />,
    JSON: <DataObject sx={{ fontSize: 18 }} />,
    URL: <Link sx={{ fontSize: 18 }} />,
};

export const ContentFieldFormDialog: React.FC<ContentFieldFormDialogProps> = ({
    open,
    contentTypeId,
    field,
    onClose,
    onSuccess,
}) => {
    const isEdit = Boolean(field);
    const [serverError, setServerError] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ContentFieldFormData>({
        resolver: zodResolver(contentFieldSchema),
        defaultValues: {
            name: '',
            key: '',
            type: 'STRING',
            isRequired: false,
        },
    });

    const nameValue = watch('name');

    // Auto-generate key from name (in snake_case) when name changes in create mode
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue('name', val, { shouldValidate: true });
        if (!isEdit) {
            const generatedKey = val
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s-]+/g, '_')
                .replace(/^_+|_+$/g, '');
            setValue('key', generatedKey, { shouldValidate: true });
        }
    };

    useEffect(() => {
        if (open) {
            setServerError(null);
            if (field) {
                reset({
                    name: field.name,
                    key: field.key,
                    type: field.type,
                    isRequired: field.isRequired,
                });
            } else {
                reset({
                    name: '',
                    key: '',
                    type: 'STRING',
                    isRequired: false,
                });
            }
        }
    }, [open, field, reset]);

    const onSubmit = async (data: ContentFieldFormData) => {
        setServerError(null);
        try {
            if (isEdit && field) {
                if (!isDirty) {
                    onClose();
                    return;
                }
                await updateContentField(field.id, {
                    name: data.name,
                    key: data.key,
                    type: data.type,
                    isRequired: data.isRequired,
                });
            } else {
                await createContentField(contentTypeId, {
                    name: data.name,
                    key: data.key,
                    type: data.type,
                    isRequired: data.isRequired,
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                'An error occurred while saving the field';
            setServerError(msg);
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
                    <Code sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                            {isEdit ? 'Edit Field' : 'Add Content Field'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {isEdit
                                ? 'Update field properties and validation rules'
                                : 'Define a structural property for this schema'}
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

                        {/* Field Name */}
                        <TextField
                            size="small"
                            label="Field Label"
                            placeholder="e.g. Price, In Stock, Description, Release Date"
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
                                            <Label sx={{ color: 'text.secondary', fontSize: 18 }} />
                                        </InputAdornment>
                                    ),
                                    sx: { fontSize: '0.8125rem' },
                                },
                            }}
                        />

                        {/* Field Key */}
                        <TextField
                            {...register('key')}
                            size="small"
                            label="Field Key (API identifier)"
                            placeholder="e.g. price, in_stock, description"
                            fullWidth
                            required
                            error={Boolean(errors.key)}
                            helperText={
                                errors.key?.message ||
                                'Identifier key used in JSON payloads and API responses (snake_case)'
                            }
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Code sx={{ color: 'text.secondary', fontSize: 18 }} />
                                        </InputAdornment>
                                    ),
                                    sx: { fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem' },
                                },
                            }}
                        />

                        {/* Field Type Select */}
                        <Controller
                            name="type"
                            control={control}
                            render={({ field: fieldProp }) => (
                                <TextField
                                    {...fieldProp}
                                    select
                                    size="small"
                                    label="Data Type"
                                    fullWidth
                                    required
                                    error={Boolean(errors.type)}
                                    helperText={errors.type?.message || 'The data format and input control'}
                                    slotProps={{
                                        input: {
                                            sx: { fontSize: '0.8125rem' },
                                        },
                                    }}
                                >
                                    {FIELD_TYPES.map((typeOption) => (
                                        <MenuItem key={typeOption.value} value={typeOption.value} sx={{ fontSize: '0.8125rem' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                                <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                                                    {FIELD_TYPE_ICONS[typeOption.value]}
                                                </Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                                                    {typeOption.label}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        {/* Required Switch */}
                        <Controller
                            name="isRequired"
                            control={control}
                            render={({ field: switchField }) => (
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
                                            Mandatory / Required Field
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Validation enforces that this property is present when saving items
                                        </Typography>
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={switchField.value}
                                                onChange={(e) => switchField.onChange(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Chip
                                                label={switchField.value ? 'Required' : 'Optional'}
                                                size="small"
                                                color={switchField.value ? 'primary' : 'default'}
                                                variant={switchField.value ? 'filled' : 'outlined'}
                                                sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22 }}
                                            />
                                        }
                                        labelPlacement="start"
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
                        startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{ textTransform: 'none', borderRadius: 1.5, px: 2, fontWeight: 600, fontSize: '0.8125rem' }}
                    >
                        {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Field'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ContentFieldFormDialog;
