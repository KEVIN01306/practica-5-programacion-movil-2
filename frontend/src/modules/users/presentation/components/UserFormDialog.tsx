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
    Alert,
    CircularProgress,
    Box,
    Autocomplete,
    FormControlLabel,
    Checkbox,
    IconButton,
    InputAdornment,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    ContentCopy,
    CheckCircleOutlined,
    Visibility,
    VisibilityOff,
    AutoAwesome,
} from '@mui/icons-material';
import {
    createUserSchema,
    updateUserSchema,
} from '../../domain/schemas/users.schemas';
import type { UserDto } from '../../domain/dto/users.dto';
import { createUser, updateUser, getRoles } from '../../infrastructure/services/users.service';

interface UserFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: UserDto | null;
}

// Cryptographically secure browser password generator
const generateClientSecurePassword = (): string => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#$%^&*()-_=+';
    const all = uppercase + lowercase + numbers + special;

    const getRandomChar = (charset: string) => {
        const randomValues = new Uint32Array(1);
        window.crypto.getRandomValues(randomValues);
        return charset[randomValues[0] % charset.length];
    };

    let password = [
        getRandomChar(uppercase),
        getRandomChar(lowercase),
        getRandomChar(numbers),
        getRandomChar(special),
    ];

    for (let i = password.length; i < 12; i++) {
        password.push(getRandomChar(all));
    }

    // Shuffle
    for (let i = password.length - 1; i > 0; i--) {
        const randomValues = new Uint32Array(1);
        window.crypto.getRandomValues(randomValues);
        const j = randomValues[0] % (i + 1);
        [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
};

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
    open,
    onClose,
    onSuccess,
    initialData,
}) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [availableRoleNames, setAvailableRoleNames] = useState<string[]>(['SUPER_ADMIN', 'ADMIN', 'USER']);
    const [autoGen, setAutoGen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isEdit = Boolean(initialData);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<any>({
        resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
        defaultValues: {
            email: '',
            passwordRaw: '',
            autoGeneratePassword: false,
            firstName: '',
            lastName: '',
            roles: ['USER'],
        },
    });

    const currentPasswordRaw = watch('passwordRaw');

    useEffect(() => {
        getRoles()
            .then((roles) => {
                if (roles && roles.length > 0) {
                    setAvailableRoleNames(roles.map((r) => r.name));
                }
            })
            .catch((err) => console.error('Failed to load roles for autocomplete', err));
    }, []);

    useEffect(() => {
        if (open) {
            setServerError(null);
            setAutoGen(false);
            setCopied(false);
            setShowPassword(false);
            if (initialData) {
                reset({
                    email: initialData.email,
                    passwordRaw: '',
                    autoGeneratePassword: false,
                    firstName: initialData.firstName,
                    lastName: initialData.lastName,
                    roles: initialData.roles && initialData.roles.length > 0 ? initialData.roles : ['USER'],
                });
            } else {
                reset({
                    email: '',
                    passwordRaw: '',
                    autoGeneratePassword: false,
                    firstName: '',
                    lastName: '',
                    roles: ['USER'],
                });
            }
        }
    }, [open, initialData, reset]);

    const handleToggleAutoGen = (checked: boolean) => {
        setAutoGen(checked);
        setValue('autoGeneratePassword', checked);
        if (checked) {
            const securePass = generateClientSecurePassword();
            setValue('passwordRaw', securePass, { shouldValidate: true });
        } else {
            setValue('passwordRaw', '', { shouldValidate: true });
        }
    };

    const handleCopyPassword = () => {
        if (currentPasswordRaw) {
            navigator.clipboard.writeText(currentPasswordRaw);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const onSubmit = async (values: any) => {
        setServerError(null);
        try {
            if (isEdit && initialData) {
                const payload: any = {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    roles: values.roles,
                };
                if (values.email && values.email !== initialData.email) {
                    payload.email = values.email;
                }
                if (values.passwordRaw && values.passwordRaw.trim() !== '') {
                    payload.passwordRaw = values.passwordRaw;
                }
                await updateUser(initialData.id, payload);
            } else {
                await createUser({
                    email: values.email,
                    passwordRaw: values.passwordRaw,
                    autoGeneratePassword: values.autoGeneratePassword,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    roles: values.roles,
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                (isEdit ? 'Failed to update user' : 'Failed to create user');
            setServerError(message);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => !isSubmitting && onClose()}
            maxWidth="sm"
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
                <DialogTitle sx={{ fontWeight: 600, fontSize: '18px', color: 'text.primary', pt: 2, px: 2.5 }}>
                    {isEdit ? 'Edit User' : 'Create New User'}
                </DialogTitle>

                <DialogContent sx={{ px: 2.5, pt: 1 }}>
                    {serverError && (
                        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setServerError(null)}>
                            {serverError}
                        </Alert>
                    )}

                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <Controller
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="user-firstname"
                                        label="First Name"
                                        required
                                        fullWidth
                                        autoFocus
                                        error={!!errors.firstName}
                                        helperText={errors.firstName?.message as string}
                                    />
                                )}
                            />

                            <Controller
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="user-lastname"
                                        label="Last Name"
                                        required
                                        fullWidth
                                        error={!!errors.lastName}
                                        helperText={errors.lastName?.message as string}
                                    />
                                )}
                            />
                        </Box>

                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id="user-email"
                                    label="Email Address"
                                    type="email"
                                    required={!isEdit}
                                    fullWidth
                                    error={!!errors.email}
                                    helperText={errors.email?.message as string}
                                />
                            )}
                        />

                        {/* Password section */}
                        {!isEdit && (
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: 'action.hover',
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={autoGen}
                                            onChange={(e) => handleToggleAutoGen(e.target.checked)}
                                            icon={<AutoAwesome fontSize="small" />}
                                            checkedIcon={<AutoAwesome fontSize="small" color="primary" />}
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            Generar contraseña automáticamente
                                        </Typography>
                                    }
                                />
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', ml: 3.5, mt: -0.5 }}>
                                    Se creará una contraseña segura y se enviará por correo al usuario con las instrucciones de activación.
                                </Typography>
                            </Box>
                        )}

                        <Controller
                            name="passwordRaw"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id="user-password"
                                    label={
                                        isEdit
                                            ? 'New Password (leave blank to keep current)'
                                            : autoGen
                                                ? 'Contraseña generada'
                                                : 'Password'
                                    }
                                    type={showPassword ? 'text' : 'password'}
                                    required={!isEdit && !autoGen}
                                    fullWidth
                                    error={!!errors.passwordRaw}
                                    helperText={
                                        (errors.passwordRaw?.message as string) ||
                                        (autoGen
                                            ? 'Esta contraseña se enviará por correo al usuario.'
                                            : !isEdit
                                                ? 'Mínimo 8 caracteres.'
                                                : undefined)
                                    }
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {field.value && (
                                                        <Tooltip title={copied ? '¡Copiado!' : 'Copiar contraseña'}>
                                                            <IconButton
                                                                onClick={handleCopyPassword}
                                                                edge="end"
                                                                size="small"
                                                                color={copied ? 'success' : 'default'}
                                                                sx={{ mr: 0.5 }}
                                                            >
                                                                {copied ? <CheckCircleOutlined fontSize="small" /> : <ContentCopy fontSize="small" />}
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <IconButton
                                                        onClick={() => setShowPassword((prev) => !prev)}
                                                        edge="end"
                                                        size="small"
                                                    >
                                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            )}
                        />

                        <Controller
                            name="roles"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    multiple
                                    id="user-roles-autocomplete"
                                    options={availableRoleNames}
                                    value={field.value || []}
                                    onChange={(_, newValue) => field.onChange(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Assigned Roles"
                                            placeholder="Select roles..."
                                            required={!isEdit}
                                            error={!!errors.roles}
                                            helperText={
                                                (errors.roles?.message as string) ||
                                                'Select one or more roles for this user'
                                            }
                                        />
                                    )}
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
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '13px',
                            px: 2.5,
                        }}
                    >
                        {isSubmitting ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UserFormDialog;
