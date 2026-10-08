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
    IconButton,
    MenuItem,
} from '@mui/material';
import {
    Close,
    ViewStream,
    ShortText,
    Notes,
    Pin,
    CheckBox,
    Event,
    Code,
    Link,
} from '@mui/icons-material';
import {
    FormFieldFormSchema,
    type FormFieldFormData,
} from '../../infrastructure/schemas/form-field.schema';
import {
    createFormField,
    updateFormField,
} from '../../infrastructure/services/forms.service';
import type { FormFieldDto, FieldTypeDto } from '../../domain/dto/forms.dto';

interface FormFieldFormDialogProps {
    open: boolean;
    formId: string;
    field?: FormFieldDto | null;
    onClose: () => void;
    onSuccess: (savedField: FormFieldDto) => void;
}

const FIELD_TYPES: { type: FieldTypeDto; label: string; icon: React.ReactNode; desc: string }[] = [
    {
        type: 'STRING',
        label: 'Short Text',
        icon: <ShortText fontSize="small" />,
        desc: 'Single line text (Name, subject, etc.)',
    },
    {
        type: 'TEXT',
        label: 'Long Text',
        icon: <Notes fontSize="small" />,
        desc: 'Multi-line message or commentary',
    },
    {
        type: 'NUMBER',
        label: 'Number',
        icon: <Pin fontSize="small" />,
        desc: 'Integer or decimal numbers',
    },
    {
        type: 'BOOLEAN',
        label: 'Checkbox / Boolean',
        icon: <CheckBox fontSize="small" />,
        desc: 'True/False toggles or consent checkboxes',
    },
    {
        type: 'DATE',
        label: 'Date',
        icon: <Event fontSize="small" />,
        desc: 'Date and time stamps',
    },
    {
        type: 'URL',
        label: 'URL / Link',
        icon: <Link fontSize="small" />,
        desc: 'Web page or asset URLs',
    },
    {
        type: 'JSON',
        label: 'JSON Object',
        icon: <Code fontSize="small" />,
        desc: 'Structured raw JSON payload',
    },
];

export const FormFieldFormDialog: React.FC<FormFieldFormDialogProps> = ({
    open,
    formId,
    field,
    onClose,
    onSuccess,
}) => {
    const isEdit = Boolean(field);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormFieldFormData>({
        resolver: zodResolver(FormFieldFormSchema),
        defaultValues: {
            label: '',
            key: '',
            type: 'STRING',
            isRequired: false,
        },
    });

    useEffect(() => {
        if (open) {
            setServerError(null);
            if (field) {
                reset({
                    label: field.label,
                    key: field.key,
                    type: field.type,
                    isRequired: field.isRequired,
                });
            } else {
                reset({
                    label: '',
                    key: '',
                    type: 'STRING',
                    isRequired: false,
                });
            }
        }
    }, [open, field, reset]);

    const handleLabelChange = (val: string) => {
        setValue('label', val, { shouldValidate: true });
        if (!isEdit) {
            const generatedKey = val
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');
            setValue('key', generatedKey, { shouldValidate: true });
        }
    };

    const onSubmit = async (data: FormFieldFormData) => {
        setServerError(null);
        try {
            if (isEdit && field) {
                const updated = await updateFormField(field.id, {
                    label: data.label,
                    key: data.key,
                    type: data.type,
                    isRequired: data.isRequired,
                });
                onSuccess(updated);
            } else {
                const created = await createFormField(formId, {
                    label: data.label,
                    key: data.key,
                    type: data.type,
                    isRequired: data.isRequired,
                });
                onSuccess(created);
            }
            onClose();
        } catch (err: any) {
            setServerError(
                err.response?.data?.message || 'An error occurred while saving the form field'
            );
        }
    };

    return (
        <Dialog
            open={open}
            onClose={isSubmitting ? undefined : onClose}
            maxWidth="xs"
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
                    <ViewStream sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                            {isEdit ? 'Edit Form Field' : 'Add Form Field'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Define property name, payload key and data type
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

                        {/* Label */}
                        <Controller
                            name="label"
                            control={control}
                            render={({ field: formField }) => (
                                <TextField
                                    {...formField}
                                    onChange={(e) => handleLabelChange(e.target.value)}
                                    label="Field Label"
                                    placeholder="e.g. Email Address"
                                    size="small"
                                    fullWidth
                                    disabled={isSubmitting}
                                    error={Boolean(errors.label)}
                                    helperText={errors.label?.message}
                                />
                            )}
                        />

                        {/* Key */}
                        <Controller
                            name="key"
                            control={control}
                            render={({ field: formField }) => (
                                <TextField
                                    {...formField}
                                    label="Property Key"
                                    placeholder="e.g. email"
                                    size="small"
                                    fullWidth
                                    disabled={isSubmitting}
                                    error={Boolean(errors.key)}
                                    helperText={
                                        errors.key?.message ||
                                        'Used in JSON submission payload: { "key": "value" }'
                                    }
                                    slotProps={{
                                        input: {
                                            sx: { fontFamily: 'monospace', fontSize: '0.8125rem' },
                                        },
                                    }}
                                />
                            )}
                        />

                        {/* Type Select */}
                        <Controller
                            name="type"
                            control={control}
                            render={({ field: formField }) => (
                                <TextField
                                    {...formField}
                                    select
                                    label="Field Data Type"
                                    size="small"
                                    fullWidth
                                    disabled={isSubmitting}
                                    error={Boolean(errors.type)}
                                    helperText={errors.type?.message}
                                >
                                    {FIELD_TYPES.map((ft) => (
                                        <MenuItem key={ft.type} value={ft.type}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                                {ft.icon}
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                                        {ft.label}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                        {ft.desc}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        {/* Required Switch */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                    Required Field
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Submissions missing this field will be rejected
                                </Typography>
                            </Box>

                            <Controller
                                name="isRequired"
                                control={control}
                                render={({ field: formField }) => (
                                    <Switch
                                        checked={formField.value}
                                        onChange={(e) => formField.onChange(e.target.checked)}
                                        disabled={isSubmitting}
                                        size="small"
                                    />
                                )}
                            />
                        </Box>
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
                        {isEdit ? 'Save Changes' : 'Add Field'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default FormFieldFormDialog;
