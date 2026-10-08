import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
    Close,
    UploadFile,
    DataObject,
    CheckCircle,
    AutoAwesome,
} from '@mui/icons-material';
import { bulkCreateContentItems } from '../../infrastructure/services/content-types.service';
import type { ContentFieldDto } from '../../domain/dto/content-types.dto';

interface JsonImportDialogProps {
    open: boolean;
    contentTypeId: string;
    contentTypeName: string;
    fields: ContentFieldDto[];
    onClose: () => void;
    onSuccess: (importedCount: number) => void;
}

export const JsonImportDialog: React.FC<JsonImportDialogProps> = ({
    open,
    contentTypeId,
    contentTypeName,
    fields,
    onClose,
    onSuccess,
}) => {
    const [jsonText, setJsonText] = useState('');
    const [isPublished, setIsPublished] = useState(true);
    const [parseError, setParseError] = useState<string | null>(null);
    const [parsedCount, setParsedCount] = useState<number | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setJsonText('');
            setParseError(null);
            setParsedCount(null);
            setServerError(null);
            setIsPublished(true);
        }
    }, [open]);

    const handleTextChange = (val: string) => {
        setJsonText(val);
        setServerError(null);

        if (!val.trim()) {
            setParseError(null);
            setParsedCount(null);
            return;
        }

        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
                setParsedCount(parsed.length);
                setParseError(null);
            } else if (parsed && typeof parsed === 'object') {
                if (Array.isArray(parsed.items)) {
                    setParsedCount(parsed.items.length);
                } else {
                    setParsedCount(1);
                }
                setParseError(null);
            } else {
                setParseError('JSON must be an object or an array of objects.');
                setParsedCount(null);
            }
        } catch (err: any) {
            setParseError(err.message || 'Invalid JSON syntax');
            setParsedCount(null);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                handleTextChange(content);
            }
        };
        reader.readAsText(file);
    };

    const handleInsertSampleTemplate = () => {
        const sampleItem: Record<string, any> = {};
        fields.forEach((f) => {
            if (f.type === 'NUMBER') {
                sampleItem[f.key] = 100;
            } else if (f.type === 'BOOLEAN') {
                sampleItem[f.key] = true;
            } else if (f.type === 'DATE') {
                sampleItem[f.key] = new Date().toISOString().split('T')[0];
            } else if (f.type === 'URL') {
                sampleItem[f.key] = 'https://example.com';
            } else if (f.type === 'JSON') {
                sampleItem[f.key] = { tag: 'sample' };
            } else {
                sampleItem[f.key] = `Sample ${f.name}`;
            }
        });

        const sampleArray = [sampleItem, { ...sampleItem }];
        handleTextChange(JSON.stringify(sampleArray, null, 2));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (!jsonText.trim()) {
            setServerError('Please provide a JSON payload or upload a JSON file.');
            return;
        }

        let parsedPayload: any;
        try {
            parsedPayload = JSON.parse(jsonText);
        } catch {
            setServerError('Invalid JSON. Please fix formatting syntax errors.');
            return;
        }

        let itemsArray: any[] = [];
        if (Array.isArray(parsedPayload)) {
            itemsArray = parsedPayload;
        } else if (parsedPayload && typeof parsedPayload === 'object') {
            if (Array.isArray(parsedPayload.items)) {
                itemsArray = parsedPayload.items;
            } else {
                itemsArray = [parsedPayload];
            }
        }

        if (itemsArray.length === 0) {
            setServerError('No items found to import in the provided JSON.');
            return;
        }

        const formatted = itemsArray.map((item) => {
            const data = item.data && typeof item.data === 'object' ? item.data : item;
            return {
                data,
                isPublished: item.isPublished !== undefined ? item.isPublished : isPublished,
            };
        });

        setIsSubmitting(true);
        try {
            const res = await bulkCreateContentItems(contentTypeId, formatted);
            onSuccess(res.count);
            onClose();
        } catch (err: any) {
            setServerError(
                err.response?.data?.message || err.message || 'Failed to import JSON content items'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={isSubmitting ? undefined : onClose}
            maxWidth="md"
            fullWidth
            slotProps={{ paper: { sx: { borderRadius: 2, p: 0.5 } } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <UploadFile sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                            Import {contentTypeName} Items from JSON
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Bulk insert single or multiple records from a JSON array or object
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

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    component="label"
                                    startIcon={<UploadFile fontSize="small" />}
                                    sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem' }}
                                >
                                    Upload .JSON File
                                    <input type="file" accept=".json,application/json" hidden onChange={handleFileUpload} />
                                </Button>
                                <Button
                                    size="small"
                                    variant="text"
                                    startIcon={<AutoAwesome fontSize="small" />}
                                    onClick={handleInsertSampleTemplate}
                                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                >
                                    Load Sample Schema Template
                                </Button>
                            </Box>

                            {parsedCount !== null && (
                                <Chip
                                    icon={<CheckCircle sx={{ fontSize: '13px !important' }} />}
                                    label={`${parsedCount} ${parsedCount === 1 ? 'item' : 'items'} detected`}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22 }}
                                />
                            )}
                        </Box>

                        <TextField
                            placeholder={`[\n  {\n    ${fields.map((f) => `"${f.key}": ...`).join(',\n    ')}\n  }\n]`}
                            multiline
                            rows={10}
                            fullWidth
                            value={jsonText}
                            onChange={(e) => handleTextChange(e.target.value)}
                            error={Boolean(parseError)}
                            helperText={parseError || 'Paste a JSON array `[{ ... }, { ... }]` or a single JSON object.'}
                            slotProps={{
                                input: {
                                    sx: {
                                        fontFamily: 'monospace',
                                        fontSize: '0.8125rem',
                                        bgcolor: 'action.hover',
                                    },
                                },
                            }}
                        />

                        {/* Publish Status Option */}
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
                                    Publish Imported Records
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Set imported items as Published so they are immediately accessible in the API
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
                        disabled={isSubmitting || Boolean(parseError) || !jsonText.trim()}
                        startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <DataObject fontSize="small" />}
                        sx={{ textTransform: 'none', borderRadius: 1.5, px: 2, fontWeight: 600, fontSize: '0.8125rem' }}
                    >
                        {isSubmitting ? 'Importing...' : `Import ${parsedCount ? `(${parsedCount})` : ''} Items`}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default JsonImportDialog;
