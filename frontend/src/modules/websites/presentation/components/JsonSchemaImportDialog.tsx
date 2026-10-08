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
    Chip,
    IconButton,
} from '@mui/material';
import {
    Close,
    UploadFile,
    DataObject,
    CheckCircle,
    AutoAwesome,
    Schema,
} from '@mui/icons-material';
import { bulkCreateFields } from '../../infrastructure/services/content-types.service';

interface JsonSchemaImportDialogProps {
    open: boolean;
    contentTypeId: string;
    contentTypeName: string;
    onClose: () => void;
    onSuccess: (importedCount: number, skippedCount: number) => void;
}

export const JsonSchemaImportDialog: React.FC<JsonSchemaImportDialogProps> = ({
    open,
    contentTypeId,
    contentTypeName,
    onClose,
    onSuccess,
}) => {
    const [jsonText, setJsonText] = useState('');
    const [parseError, setParseError] = useState<string | null>(null);
    const [parsedFields, setParsedFields] = useState<any[] | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setJsonText('');
            setParseError(null);
            setParsedFields(null);
            setServerError(null);
        }
    }, [open]);

    const handleTextChange = (text: string) => {
        setJsonText(text);
        setServerError(null);

        if (!text.trim()) {
            setParseError(null);
            setParsedFields(null);
            return;
        }

        try {
            const parsed = JSON.parse(text);
            const arrayData = Array.isArray(parsed)
                ? parsed
                : Array.isArray(parsed.fields)
                ? parsed.fields
                : [parsed];

            if (arrayData.length === 0) {
                setParseError('El JSON debe contener al menos un campo para el esquema');
                setParsedFields(null);
                return;
            }

            // Validate that elements have name and key
            for (let i = 0; i < arrayData.length; i++) {
                const item = arrayData[i];
                if (!item || typeof item !== 'object') {
                    setParseError(`El elemento #${i + 1} no es un objeto válido`);
                    setParsedFields(null);
                    return;
                }
                if (!item.name || typeof item.name !== 'string') {
                    setParseError(`El campo #${i + 1} requiere un 'name' (string)`);
                    setParsedFields(null);
                    return;
                }
                if (!item.key || typeof item.key !== 'string') {
                    setParseError(`El campo #${i + 1} requiere un 'key' (string)`);
                    setParsedFields(null);
                    return;
                }
            }

            setParseError(null);
            setParsedFields(arrayData);
        } catch (e: any) {
            setParseError(`JSON inválido: ${e.message}`);
            setParsedFields(null);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            handleTextChange(content);
        };
        reader.readAsText(file);
        // Reset input value so same file can be re-selected if desired
        event.target.value = '';
    };

    const handleGenerateTemplate = () => {
        const sampleSchema = [
            {
                name: "Nombre",
                key: "name",
                type: "STRING",
                isRequired: true
            },
            {
                name: "Slug",
                key: "slug",
                type: "STRING",
                isRequired: true
            },
            {
                name: "SKU",
                key: "sku",
                type: "STRING",
                isRequired: false
            },
            {
                name: "Precio",
                key: "price",
                type: "NUMBER",
                isRequired: false
            },
            {
                name: "Categoría",
                key: "category",
                type: "STRING",
                isRequired: false
            },
            {
                name: "Descripción",
                key: "description",
                type: "TEXT",
                isRequired: false
            },
            {
                name: "Imagen URL",
                key: "image",
                type: "URL",
                isRequired: false
            },
            {
                name: "En Stock",
                key: "in_stock",
                type: "BOOLEAN",
                isRequired: false
            }
        ];

        handleTextChange(JSON.stringify(sampleSchema, null, 2));
    };

    const handleSubmit = async () => {
        if (!parsedFields || parsedFields.length === 0) return;

        setIsSubmitting(true);
        setServerError(null);

        try {
            const result = await bulkCreateFields(contentTypeId, parsedFields);
            onSuccess(result.totalCreated, result.skipped.length);
            onClose();
        } catch (err: any) {
            const errorMsg =
                err.response?.data?.message || err.message || 'Error al importar los campos del esquema';
            setServerError(errorMsg);
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
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 2,
                    },
                },
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2.5, pb: 1.5 }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1.5,
                                bgcolor: (theme) =>
                                    theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : '#ede9fe',
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Schema fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                Importar Esquema de Campos (JSON)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Para el Content Type: <strong>{contentTypeName}</strong>
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton
                        size="small"
                        onClick={onClose}
                        disabled={isSubmitting}
                        sx={{ color: 'text.secondary' }}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                        }}
                    >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                startIcon={<UploadFile fontSize="small" />}
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
                            >
                                Subir Archivo .json
                                <input
                                    type="file"
                                    hidden
                                    accept=".json,application/json"
                                    onChange={handleFileUpload}
                                />
                            </Button>
                            <Button
                                variant="text"
                                size="small"
                                startIcon={<AutoAwesome fontSize="small" />}
                                onClick={handleGenerateTemplate}
                                sx={{ textTransform: 'none' }}
                            >
                                Cargar Plantilla
                            </Button>
                        </Stack>

                        {parsedFields && (
                            <Chip
                                icon={<CheckCircle fontSize="small" />}
                                label={`${parsedFields.length} campos válidos`}
                                color="success"
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                            />
                        )}
                    </Stack>

                    {serverError && (
                        <Alert severity="error" onClose={() => setServerError(null)} sx={{ borderRadius: 1.5 }}>
                            {serverError}
                        </Alert>
                    )}

                    {parseError && (
                        <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
                            {parseError}
                        </Alert>
                    )}

                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                            Estructura permitida: Array con objetos <DataObject sx={{ fontSize: 13, verticalAlign: 'middle' }} /> que contengan <code>name</code>, <code>key</code>, <code>type</code> (STRING, TEXT, NUMBER, BOOLEAN, DATE, JSON, URL) y opcionalmente <code>isRequired</code>.
                        </Typography>
                        <TextField
                            multiline
                            rows={12}
                            fullWidth
                            value={jsonText}
                            onChange={(e) => handleTextChange(e.target.value)}
                            placeholder={`[\n  {\n    "name": "Nombre",\n    "key": "name",\n    "type": "STRING",\n    "isRequired": true\n  }\n]`}
                            error={Boolean(parseError)}
                            disabled={isSubmitting}
                            sx={{
                                '& .MuiInputBase-root': {
                                    fontFamily: 'monospace',
                                    fontSize: '0.85rem',
                                    borderRadius: 2,
                                    bgcolor: (theme) =>
                                        theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#f8fafc',
                                },
                            }}
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.5 }}>
                <Button
                    onClick={onClose}
                    disabled={isSubmitting}
                    color="inherit"
                    size="small"
                    sx={{ textTransform: 'none' }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !parsedFields || parsedFields.length === 0 || Boolean(parseError)}
                    variant="contained"
                    size="small"
                    startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Schema fontSize="small" />}
                    sx={{ textTransform: 'none', borderRadius: 1.5, px: 2 }}
                >
                    {isSubmitting
                        ? 'Importando...'
                        : parsedFields
                        ? `Importar ${parsedFields.length} Campos`
                        : 'Importar Campos'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
