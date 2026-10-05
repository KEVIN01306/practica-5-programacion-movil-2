import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Alert,
    Snackbar,
    Button,
} from '@mui/material';
import {
    PersonOutlineOutlined,
    EmailOutlined,
    BusinessOutlined,
    BadgeOutlined,
    SecurityOutlined,
    CheckCircle,
    CalendarMonthOutlined,
    ContentCopyOutlined,
    MenuBookOutlined,
    FingerprintOutlined,
    Check,
    LockResetOutlined,
} from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';
import { getCurrentUser } from '../../../auth/infrastructure/services/auth.service';
import type { AuthUser } from '../../../auth/domain/interfaces/auth.interfaces';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';

interface ProfileRowProps {
    icon?: React.ReactNode;
    label: string;
    value: React.ReactNode;
    isLast?: boolean;
}

const ProfileRow: React.FC<ProfileRowProps> = ({ icon, label, value, isLast = false }) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            py: 1.75,
            px: { xs: 2.5, sm: 3 },
            borderBottom: isLast ? 'none' : '0.5px solid',
            borderColor: 'divider',
            transition: 'background-color 0.15s ease',
            '&:hover': {
                bgcolor: 'action.hover',
            },
            gap: 1,
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 240 }}>
            {icon && (
                <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', fontSize: '18px' }}>
                    {icon}
                </Box>
            )}
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04rem',
                    fontSize: '11px',
                }}
            >
                {label}
            </Typography>
        </Box>

        <Box
            sx={{
                color: 'text.primary',
                fontWeight: 450,
                fontSize: '13px',
                textAlign: { xs: 'left', sm: 'right' },
                wordBreak: 'break-word',
            }}
        >
            {value || '-'}
        </Box>
    </Box>
);

const GoogleCard: React.FC<{
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}> = ({ title, subtitle, icon, children }) => (
    <Paper
        elevation={0}
        sx={{
            border: '0.5px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            overflow: 'hidden',
            mb: 3,
            bgcolor: 'background.paper',
            boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                    ? '0 20px 44px rgba(0,0,0,0.14)'
                    : '0 4px 20px rgba(0,0,0,0.04)',
        }}
    >
        <Box sx={{ p: { xs: 2.5, sm: 3 }, pb: 2, borderBottom: '0.5px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                {icon && (
                    <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', fontSize: 18 }}>
                        {icon}
                    </Box>
                )}
                <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '16px', letterSpacing: '-0.32px', color: 'text.primary' }}>
                    {title}
                </Typography>
            </Box>
            {subtitle && (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
        <Box>{children}</Box>
    </Paper>
);

export const ProfilePage: React.FC = () => {
    const { user: cachedUser, accessToken, setUser } = useAuthStore();
    const [profile, setProfile] = useState<AuthUser | null>(cachedUser);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({
        open: false,
        message: '',
        severity: 'info',
    });

    useEffect(() => {
        if (!accessToken) return;

        const loadProfile = async () => {
            setLoading(true);
            try {
                const freshUser = await getCurrentUser(accessToken);
                setProfile(freshUser);
                setUser(freshUser);
            } catch {
                setError('Error al actualizar la información del perfil');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [accessToken, setUser]);

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setSnackbar({
            open: true,
            message: 'ID copiado al portapapeles',
            severity: 'info',
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const displayUser = profile || cachedUser;

    if (loading && !displayUser) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress sx={{ color: '#3b82f6' }} />
            </Box>
        );
    }

    if (!displayUser) return null;

    const initials = displayUser.name
        ? displayUser.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
        : (displayUser.email?.charAt(0).toUpperCase() || 'U');

    const firstName = displayUser.firstName || displayUser.name?.split(' ')[0] || '';
    const lastName = displayUser.lastName || displayUser.name?.split(' ').slice(1).join(' ') || '';
    const rolesList = displayUser.roles && displayUser.roles.length > 0
        ? displayUser.roles
        : (displayUser.role ? [displayUser.role] : ['Usuario']);

    const formattedDate = displayUser.createdAt
        ? new Date(displayUser.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'Activo en el sistema';

    return (
        <Box sx={{ maxWidth: 960, mx: 'auto', py: 2, px: { xs: 1, sm: 3 } }}>
            {error && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Header Banner */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    py: 4,
                    mb: 2,
                }}
            >
                <Avatar
                    sx={{
                        width: 88,
                        height: 88,
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1f1f21' : '#f1f5f9'),
                        color: 'primary.main',
                        fontSize: '2rem',
                        fontWeight: 600,
                        mb: 2,
                        border: '0.5px solid',
                        borderColor: 'divider',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.25)',
                    }}
                >
                    {initials}
                </Avatar>

                <Typography variant="h4" sx={{ fontWeight: 500, fontSize: '24px', letterSpacing: '-0.64px', mb: 0.5, color: 'text.primary' }}>
                    {displayUser.name}
                </Typography>

                <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '13px', mb: 2 }}>
                    {displayUser.email}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {rolesList.map((role) => (
                        <Chip
                            key={role}
                            icon={<SecurityOutlined sx={{ fontSize: 16 }} />}
                            label={role}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontWeight: 500,
                                fontSize: '11px',
                                borderRadius: '6px',
                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                color: '#60a5fa',
                                bgcolor: 'rgba(59, 130, 246, 0.08)',
                            }}
                        />
                    ))}

                    <Chip
                        icon={<CheckCircle sx={{ fontSize: 16, color: 'success.main !important' }} />}
                        label={displayUser.isActive !== false ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                        size="small"
                        variant="outlined"
                        sx={{
                            fontWeight: 500,
                            fontSize: '11px',
                            borderRadius: '6px',
                            borderColor: 'rgba(34, 197, 94, 0.3)',
                            color: '#4ade80',
                            bgcolor: 'rgba(34, 197, 94, 0.08)',
                        }}
                    />

                    <Chip
                        icon={<BusinessOutlined sx={{ fontSize: 16 }} />}
                        label="Sistema de Archivo e Imágenes"
                        variant="outlined"
                        size="small"
                        sx={{
                            fontWeight: 450,
                            fontSize: '11px',
                            borderRadius: '6px',
                            borderColor: 'divider',
                            color: 'text.secondary',
                            bgcolor: 'action.hover',
                        }}
                    />
                </Box>
            </Box>

            {/* Card 1: Información Personal Básica */}
            <GoogleCard
                title="Información personal"
                subtitle="Información básica de tu identidad en el sistema"
                icon={<PersonOutlineOutlined />}
            >
                <ProfileRow
                    icon={<PersonOutlineOutlined />}
                    label="Nombre Completo"
                    value={displayUser.name}
                />
                {firstName && (
                    <ProfileRow
                        icon={<PersonOutlineOutlined />}
                        label="Nombres"
                        value={firstName}
                    />
                )}
                {lastName && (
                    <ProfileRow
                        icon={<PersonOutlineOutlined />}
                        label="Apellidos"
                        value={lastName}
                    />
                )}
                <ProfileRow
                    icon={<EmailOutlined />}
                    label="Correo Electrónico"
                    value={displayUser.email}
                />
                <ProfileRow
                    icon={<BadgeOutlined />}
                    label="Roles de Usuario"
                    isLast
                    value={
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                            {rolesList.map((role) => (
                                <Chip
                                    key={role}
                                    label={role}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px' }}
                                />
                            ))}
                        </Box>
                    }
                />
            </GoogleCard>

            {/* Card 2: Entorno y Plataforma */}
            <GoogleCard
                title="Entorno y Asignación Institucional"
                subtitle="Detalles de la plataforma y ámbito asignado al usuario"
                icon={<BusinessOutlined />}
            >
                <ProfileRow
                    icon={<BusinessOutlined />}
                    label="Plataforma / Sistema"
                    value={
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            Sistema de Gestión y Archivo de Imágenes
                        </Typography>
                    }
                />
                <ProfileRow
                    icon={<MenuBookOutlined />}
                    label="Ámbito Operativo"
                    value="Gestión de Marcas, Directorios y Archivos Digitales"
                />
                <ProfileRow
                    icon={<SecurityOutlined />}
                    label="Nivel de Acceso"
                    isLast
                    value={rolesList.join(', ')}
                />
            </GoogleCard>

            {/* Card 3: Seguridad y Estado de la Cuenta */}
            <GoogleCard
                title="Seguridad y Estado de la Cuenta"
                subtitle="Control de acceso y registro en la plataforma"
                icon={<SecurityOutlined />}
            >
                <ProfileRow
                    icon={<CheckCircle />}
                    label="Estado de la Cuenta"
                    value={
                        <Chip
                            icon={<CheckCircle fontSize="small" sx={{ color: 'success.main !important' }} />}
                            label={displayUser.isActive !== false ? 'Activa y Verificada' : 'Inactiva'}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(46, 125, 50, 0.08)',
                                color: 'success.dark',
                                fontWeight: 600,
                                borderRadius: '6px',
                            }}
                        />
                    }
                />
                <ProfileRow
                    icon={<LockResetOutlined />}
                    label="Contraseña de Acceso"
                    value={
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<LockResetOutlined sx={{ fontSize: 16 }} />}
                            onClick={() => setPasswordDialogOpen(true)}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 500,
                                fontSize: '12px',
                                px: 1.75,
                                py: 0.5,
                            }}
                        >
                            Cambiar contraseña
                        </Button>
                    }
                />
                <ProfileRow
                    icon={<CalendarMonthOutlined />}
                    label="Miembro Desde"
                    value={formattedDate}
                />
                <ProfileRow
                    icon={<FingerprintOutlined />}
                    label="ID de Usuario"
                    isLast
                    value={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontFamily: 'monospace',
                                    bgcolor: 'action.selected',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.8rem',
                                    userSelect: 'all',
                                }}
                            >
                                {displayUser.id}
                            </Typography>
                            <Tooltip title={copied ? '¡Copiado!' : 'Copiar ID'}>
                                <IconButton size="small" onClick={() => handleCopyId(displayUser.id)}>
                                    {copied ? (
                                        <Check fontSize="small" color="success" />
                                    ) : (
                                        <ContentCopyOutlined fontSize="small" />
                                    )}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }
                />
            </GoogleCard>

            <ChangePasswordDialog
                open={passwordDialogOpen}
                onClose={() => setPasswordDialogOpen(false)}
                onSuccess={() => {
                    setSnackbar({
                        open: true,
                        message: 'Contraseña actualizada exitosamente',
                        severity: 'success',
                    });
                }}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: '8px' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProfilePage;
