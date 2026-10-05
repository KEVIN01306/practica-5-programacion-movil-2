import React, { useState, useEffect } from 'react';
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
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
    Typography,
    Box,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    LockResetOutlined,
} from '@mui/icons-material';
import {
    changePasswordSchema,
    type ChangePasswordFormValues,
} from '../../domain/schemas/profile.schemas';
import { changePassword } from '../../infrastructure/services/profile.service';

interface ChangePasswordDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
    open,
    onClose,
    onSuccess,
}) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (open) {
            setServerError(null);
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            reset({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        }
    }, [open, reset]);

    const onSubmit = async (values: ChangePasswordFormValues) => {
        setServerError(null);
        try {
            await changePassword(values);
            onSuccess();
            onClose();
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                'Error al cambiar la contraseña. Verifique los datos e intente nuevamente.';
            setServerError(message);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => !isSubmitting && onClose()}
            maxWidth="xs"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '16px',
                        p: 1,
                        border: '0.5px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    },
                },
            }}
        >
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogTitle sx={{ pt: 2, px: 2.5, pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <LockResetOutlined sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '17px', color: 'text.primary' }}>
                                Cambiar contraseña
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary' }}>
                                Actualiza las credenciales de tu cuenta
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ px: 2.5, pt: 1.5 }}>
                    {serverError && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2.5, borderRadius: 2 }}
                            onClose={() => setServerError(null)}
                        >
                            {serverError}
                        </Alert>
                    )}

                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <Controller
                            name="currentPassword"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id="current-password"
                                    label="Contraseña actual"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    required
                                    fullWidth
                                    autoFocus
                                    error={!!errors.currentPassword}
                                    helperText={errors.currentPassword?.message}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                                                        edge="end"
                                                        size="small"
                                                        tabIndex={-1}
                                                        aria-label="mostrar u ocultar contraseña actual"
                                                    >
                                                        {showCurrentPassword ? (
                                                            <VisibilityOff fontSize="small" />
                                                        ) : (
                                                            <Visibility fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            )}
                        />

                        <Controller
                            name="newPassword"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id="new-password"
                                    label="Nueva contraseña"
                                    type={showNewPassword ? 'text' : 'password'}
                                    required
                                    fullWidth
                                    error={!!errors.newPassword}
                                    helperText={
                                        errors.newPassword?.message ||
                                        'Mínimo 8 caracteres'
                                    }
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                                        edge="end"
                                                        size="small"
                                                        tabIndex={-1}
                                                        aria-label="mostrar u ocultar nueva contraseña"
                                                    >
                                                        {showNewPassword ? (
                                                            <VisibilityOff fontSize="small" />
                                                        ) : (
                                                            <Visibility fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            )}
                        />

                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id="confirm-password"
                                    label="Confirmar nueva contraseña"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    fullWidth
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword?.message}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                        edge="end"
                                                        size="small"
                                                        tabIndex={-1}
                                                        aria-label="mostrar u ocultar confirmación de contraseña"
                                                    >
                                                        {showConfirmPassword ? (
                                                            <VisibilityOff fontSize="small" />
                                                        ) : (
                                                            <Visibility fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            )}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
                    <Button
                        onClick={onClose}
                        disabled={isSubmitting}
                        variant="outlined"
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 450,
                            fontSize: '13px',
                            color: 'text.secondary',
                            borderColor: 'divider',
                            px: 2.5,
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={
                            isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined
                        }
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '13px',
                            px: 2.5,
                        }}
                    >
                        {isSubmitting ? 'Cambiando...' : 'Cambiar contraseña'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ChangePasswordDialog;
