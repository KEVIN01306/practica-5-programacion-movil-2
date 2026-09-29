import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Alert,
    CircularProgress,
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import { Close, Security, EditNote } from '@mui/icons-material';
import type { RoleItem } from '../../domain/role.entity';
import { createRole, updateRole } from '../../infrastructure/services/roles.service';

interface RoleFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: RoleItem | null;
}

interface FormValues {
    name: string;
    description: string;
}

export const RoleFormDialog: React.FC<RoleFormDialogProps> = ({
    open,
    onClose,
    onSuccess,
    initialData,
}) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const isEdit = Boolean(initialData);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name: '',
            description: '',
        },
    });

    useEffect(() => {
        if (open) {
            setServerError(null);
            if (initialData) {
                reset({
                    name: initialData.name,
                    description: initialData.description || '',
                });
            } else {
                reset({
                    name: '',
                    description: '',
                });
            }
        }
    }, [open, initialData, reset]);

    const onSubmit = async (values: FormValues) => {
        setServerError(null);
        try {
            if (isEdit && initialData) {
                await updateRole(initialData.id, {
                    name: values.name.trim().toUpperCase(),
                    description: values.description.trim() || null,
                });
            } else {
                await createRole({
                    name: values.name.trim().toUpperCase(),
                    description: values.description.trim() || null,
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                (isEdit ? 'Failed to update role' : 'Failed to create role');
            setServerError(msg);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: { borderRadius: 3, p: 0.5 },
                },
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f1f5f9',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isEdit ? '#eff6ff' : '#ecfdf5',
                            color: isEdit ? '#2563eb' : '#059669',
                        }}
                    >
                        {isEdit ? <EditNote /> : <Security />}
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>
                            {isEdit ? 'Editar Rol' : 'Crear Nuevo Rol'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {isEdit
                                ? 'Modifica los datos del rol existente en el sistema'
                                : 'Define un nuevo rol con nombre identificador único'}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                        {serverError && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                {serverError}
                            </Alert>
                        )}

                        <Controller
                            name="name"
                            control={control}
                            rules={{
                                required: 'El nombre del rol es obligatorio',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                                maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Nombre del Rol *"
                                    placeholder="Ej: SUPERVISOR, MANAGER, ASISTENTE"
                                    fullWidth
                                    error={Boolean(errors.name)}
                                    helperText={errors.name?.message || 'Se normalizará automáticamente en MAYÚSCULAS'}
                                    disabled={isSubmitting}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            rules={{
                                maxLength: { value: 255, message: 'Máximo 255 caracteres' },
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Descripción"
                                    placeholder="Describe las responsabilidades o alcance de este rol..."
                                    fullWidth
                                    multiline
                                    rows={3}
                                    error={Boolean(errors.description)}
                                    helperText={errors.description?.message}
                                    disabled={isSubmitting}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            )}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        disabled={isSubmitting}
                        sx={{ textTransform: 'none', borderRadius: 2, px: 2.5 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 3,
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                        }}
                    >
                        {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Rol'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default RoleFormDialog;
