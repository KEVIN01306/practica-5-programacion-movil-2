import React, { useEffect, useState } from 'react';
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
    FormControlLabel,
    Switch,
    Chip,
    IconButton,
    InputAdornment,
    Divider,
} from '@mui/material';
import {
    Close,
    DataObject,
    CheckCircle,
    CalendarToday,
    Link,
    Pin,
    ShortText,
    Notes,
    ToggleOn,
} from '@mui/icons-material';
import {
    createContentItem,
    updateContentItem,
} from '../../infrastructure/services/content-types.service';
import type { ContentFieldDto, ContentItemDto, FieldType } from '../../domain/dto/content-types.dto';

interface ContentItemFormDialogProps {
    open: boolean;
    contentTypeId: string;
    contentTypeName: string;
    fields: ContentFieldDto[];
    item?: ContentItemDto | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const ContentItemFormDialog: React.FC<ContentItemFormDialogProps> = ({
    open,
    contentTypeId,
    contentTypeName,
    fields,
    item,
    onClose,
    onSuccess,
}) => {
    const isEdit = Boolean(item);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isPublished, setIsPublished] = useState(true);
    const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setServerError(null);
            setJsonErrors({});
            if (item) {
                setFormData(item.data || {});
                setIsPublished(item.isPublished ?? true);
            } else {
                const initial: Record<string, any> = {};
                fields.forEach((f) => {
                    if (f.type === 'BOOLEAN') {
                        initial[f.key] = false;
                    } else if (f.type === 'NUMBER') {
                        initial[f.key] = '';
                    } else if (f.type === 'JSON') {
                        initial[f.key] = '{}';
                    } else {
                        initial[f.key] = '';
                    }
                });
                setFormData(initial);
                setIsPublished(true);
            }
        }
    }, [open, item, fields]);

    const handleFieldChange = (key: string, value: any, type: FieldType) => {
        let processed = value;

        if (type === 'NUMBER') {
            processed = value === '' ? '' : Number(value);
        }

        setFormData((prev) => ({
            ...prev,
            [key]: processed,
        }));

        if (type === 'JSON') {
            try {
                if (typeof value === 'string' && value.trim()) {
                    JSON.parse(value);
                }
                setJsonErrors((prev) => {
                    const copy = { ...prev };
                    delete copy[key];
                    return copy;
                });
            } catch {
                setJsonErrors((prev) => ({
                    ...prev,
                    [key]: 'Invalid JSON format',
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        // Validate required fields
        for (const f of fields) {
            if (f.isRequired) {
                const val = formData[f.key];
                if (val === undefined || val === null || val === '') {
                    setServerError(`Field "${f.name}" is required.`);
                    return;
                }
            }
        }

        // Validate JSON fields
        if (Object.keys(jsonErrors).length > 0) {
            setServerError('Please fix invalid JSON fields before saving.');
            return;
        }

        // Prepare payload data
        const payloadData: Record<string, any> = {};
        for (const f of fields) {
            const val = formData[f.key];
            if (f.type === 'JSON' && typeof val === 'string' && val.trim()) {
                try {
                    payloadData[f.key] = JSON.parse(val);
                } catch {
                    payloadData[f.key] = val;
                }
            } else if (f.type === 'NUMBER' && val !== '') {
                payloadData[f.key] = Number(val);
            } else {
                payloadData[f.key] = val;
            }
        }

        setIsSubmitting(true);
        try {
            if (isEdit && item) {
                await updateContentItem(item.id, {
                    data: payloadData,
                    isPublished,
                });
            } else {
                await createContentItem(contentTypeId, {
                    data: payloadData,
                    isPublished,
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setServerError(
                err.response?.data?.message || err.message || 'Failed to save content item'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDynamicInput = (field: ContentFieldDto) => {
        const val = formData[field.key];

        switch (field.type) {
            case 'BOOLEAN':
                return (
                    <Box
                        key={field.id}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ToggleOn sx={{ color: 'text.secondary', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                    {field.name}
                                </Typography>
                                {field.isRequired && (
                                    <Chip label="Required" size="small" color="primary" sx={{ height: 18, fontSize: '0.7rem' }} />
                                )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                key: {field.key}
                            </Typography>
                        </Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={Boolean(val)}
                                    onChange={(e) => handleFieldChange(field.key, e.target.checked, field.type)}
                                    color="primary"
                                />
                            }
                            label={val ? 'True' : 'False'}
                            labelPlacement="start"
                            sx={{ m: 0 }}
                        />
                    </Box>
                );

            case 'TEXT':
                return (
                    <TextField
                        key={field.id}
                        size="small"
                        label={field.name}
                        placeholder={`Enter ${field.name.toLowerCase()}...`}
                        required={field.isRequired}
                        fullWidth
                        multiline
                        rows={3}
                        value={val || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                        helperText={`Key: ${field.key}`}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 0.75 }}>
                                        <Notes sx={{ color: 'text.secondary', fontSize: 18 }} />
                                    </InputAdornment>
                                ),
                                sx: { fontSize: '0.8125rem' },
                            },
                        }}
                    />
                );

            case 'NUMBER':
                return (
                    <TextField
                        key={field.id}
                        size="small"
                        label={field.name}
                        type="number"
                        placeholder="0"
                        required={field.isRequired}
                        fullWidth
                        value={val !== undefined ? val : ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                        helperText={`Key: ${field.key} (Numeric)`}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Pin sx={{ color: 'text.secondary', fontSize: 18 }} />
                                    </InputAdornment>
                                ),
                                sx: { fontSize: '0.8125rem' },
                            },
                        }}
                    />
                );

            case 'DATE':
                return (
                    <TextField
                        key={field.id}
                        size="small"
                        label={field.name}
                        type="date"
                        required={field.isRequired}
                        fullWidth
                        value={val ? String(val).split('T')[0] : ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                        helperText={`Key: ${field.key} (Date)`}
                        slotProps={{
                            inputLabel: { shrink: true },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CalendarToday sx={{ color: 'text.secondary', fontSize: 18 }} />
                                    </InputAdornment>
                                ),
                                sx: { fontSize: '0.8125rem' },
                            },
                        }}
                    />
                );

            case 'URL':
                return (
                    <TextField
                        key={field.id}
                        size="small"
                        label={field.name}
                        type="url"
                        placeholder="https://example.com"
                        required={field.isRequired}
                        fullWidth
                        value={val || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                        helperText={`Key: ${field.key} (URL)`}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Link sx={{ color: 'text.secondary', fontSize: 18 }} />
                                    </InputAdornment>
                                ),
                                sx: { fontSize: '0.8125rem' },
                            },
                        }}
                    />
                );

            case 'JSON':
                return (
                    <TextField
                        key={field.id}
                        size="small"
                        label={field.name}
                        placeholder='{"key": "value"}'
                        required={field.isRequired}
                        fullWidth
                        multiline
                        rows={4}
                        error={Boolean(jsonErrors[field.key])}
                        helperText={jsonErrors[field.key] || `Key: ${field.key} (JSON)`}
                        value={typeof val === 'object' ? JSON.stringify(val, null, 2) : val || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                        slotProps={{
                            input: {
                                sx: { fontFamily: 'monospace', fontSize: '0.8125rem' },
                            },
                        }}
                    />
                );

            case 'STRING':
            default:
                return (
                    <TextField
                        key={field.id}
                        size="small"
                        label={field.name}
                        placeholder={`Enter ${field.name.toLowerCase()}...`}
                        required={field.isRequired}
                        fullWidth
                        value={val || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                        helperText={`Key: ${field.key}`}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <ShortText sx={{ color: 'text.secondary', fontSize: 18 }} />
                                    </InputAdornment>
                                ),
                                sx: { fontSize: '0.8125rem' },
                            },
                        }}
                    />
                );
        }
    };

    return (
        <Dialog
            open={open}
            onClose={isSubmitting ? undefined : onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: { borderRadius: 2, p: 0.5 },
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <DataObject sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                            {isEdit ? `Edit ${contentTypeName} Item` : `New ${contentTypeName} Item`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Enter values according to the schema definition
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} disabled={isSubmitting} size="small">
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ borderColor: 'divider', p: 2.5 }}>
                    <Stack spacing={2}>
                        {serverError && (
                            <Alert severity="error" sx={{ borderRadius: 1.5, fontSize: '0.8125rem' }}>
                                {serverError}
                            </Alert>
                        )}

                        {fields.length === 0 ? (
                            <Alert severity="info" sx={{ borderRadius: 1.5, fontSize: '0.8125rem' }}>
                                This Content Type has no schema fields configured yet. Please add fields in the "Schema Fields" tab first.
                            </Alert>
                        ) : (
                            fields.map((f) => renderDynamicInput(f))
                        )}

                        <Divider sx={{ my: 0.5 }} />

                        {/* Publication status */}
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                    Publishing Status
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Published items are immediately accessible via the public headless API
                                </Typography>
                            </Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        size="small"
                                        checked={isPublished}
                                        onChange={(e) => setIsPublished(e.target.checked)}
                                        color="success"
                                    />
                                }
                                label={
                                    <Chip
                                        icon={<CheckCircle sx={{ fontSize: '13px !important' }} />}
                                        label={isPublished ? 'Published' : 'Draft'}
                                        size="small"
                                        color={isPublished ? 'success' : 'default'}
                                        sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22 }}
                                    />
                                }
                                labelPlacement="start"
                                sx={{ m: 0 }}
                            />
                        </Box>
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
                        disabled={isSubmitting || fields.length === 0}
                        startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{ textTransform: 'none', borderRadius: 1.5, px: 2, fontWeight: 600, fontSize: '0.8125rem' }}
                    >
                        {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Item'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ContentItemFormDialog;
