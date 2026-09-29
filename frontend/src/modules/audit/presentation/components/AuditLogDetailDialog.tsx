import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    Avatar,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Collapse,
    Tooltip,
} from '@mui/material';
import {
    Close,
    Person,
    Http,
    Schedule,
    CompareArrows,
    Storage,
    Folder,
    Business,
    Security,
    Code,
    ExpandMore,
    ExpandLess,
    ContentCopy,
    Check,
} from '@mui/icons-material';
import type { AuditLogItem, AuditAction } from '../../domain/audit.entity';

interface AuditLogDetailDialogProps {
    open: boolean;
    onClose: () => void;
    log: AuditLogItem | null;
}

const getActionColor = (action: AuditAction): { bg: string; color: string; border: string } => {
    switch (action) {
        case 'CREATE':
            return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
        case 'UPDATE':
            return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
        case 'DELETE':
            return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
        case 'LOGIN':
            return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
        case 'LOGOUT':
            return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
        default:
            return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
};

const getResourceIcon = (resource: string) => {
    switch (resource.toLowerCase()) {
        case 'auth':
            return <Security fontSize="small" sx={{ color: '#6366f1' }} />;
        case 'user':
            return <Person fontSize="small" sx={{ color: '#0284c7' }} />;
        case 'brand':
            return <Business fontSize="small" sx={{ color: '#059669' }} />;
        case 'folder':
            return <Folder fontSize="small" sx={{ color: '#d97706' }} />;
        case 'asset':
            return <Storage fontSize="small" sx={{ color: '#7c3aed' }} />;
        case 'role':
            return <Security fontSize="small" sx={{ color: '#4f46e5' }} />;
        default:
            return <Storage fontSize="small" sx={{ color: '#64748b' }} />;
    }
};

const formatBytes = (bytes?: number): string => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return '-';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatValue = (val: any): string => {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
};

export const AuditLogDetailDialog: React.FC<AuditLogDetailDialogProps> = ({
    open,
    onClose,
    log,
}) => {
    const [rawDetailsOpen, setRawDetailsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!log) return null;

    const actionColors = getActionColor(log.action);
    const details = log.details || {};

    const rawChanges = details.changes as Record<string, any> | undefined;
    const addedPermissions = (rawChanges?.addedPermissions || details.addedPermissions) as string[] | undefined;
    const removedPermissions = (rawChanges?.removedPermissions || details.removedPermissions) as string[] | undefined;
    const hasPermissionChanges = Boolean(
        (Array.isArray(addedPermissions) && addedPermissions.length > 0) ||
        (Array.isArray(removedPermissions) && removedPermissions.length > 0)
    );

    // Filter out array-type metadata keys from generic {from, to} changes table
    const fieldChanges = rawChanges
        ? Object.entries(rawChanges).reduce((acc, [k, v]) => {
              if (k !== 'addedPermissions' && k !== 'removedPermissions' && v && typeof v === 'object' && 'from' in v) {
                  acc[k] = v;
              }
              return acc;
          }, {} as Record<string, { from: any; to: any }>)
        : {};

    const deletedState = details.deleted as Record<string, any> | undefined;
    const fileReplaced = details.file as {
        oldFileName?: string;
        newFileName?: string;
        oldMimeType?: string;
        newMimeType?: string;
        oldSizeBytes?: number;
        newSizeBytes?: number;
    } | undefined;

    const handleCopyJson = () => {
        navigator.clipboard.writeText(JSON.stringify(log, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Chip
                        label={log.action}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            backgroundColor: actionColors.bg,
                            color: actionColors.color,
                            border: `1px solid ${actionColors.border}`,
                            letterSpacing: '0.5px',
                        }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getResourceIcon(log.resource)}
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {log.resource.toUpperCase()}
                        </Typography>
                    </Box>
                    {log.resourceId && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#64748b',
                                fontFamily: 'monospace',
                                backgroundColor: '#ffffff',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                border: '1px solid #e2e8f0',
                            }}
                        >
                            ID: {log.resourceId}
                        </Typography>
                    )}
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Top Section: User & Request info side-by-side */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        {/* 1. User Overview */}
                        <Paper
                            variant="outlined"
                            sx={{ p: 2, borderColor: '#e2e8f0', borderRadius: 2 }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    textTransform: 'uppercase',
                                    fontWeight: 700,
                                    color: '#64748b',
                                    display: 'block',
                                    mb: 1.5,
                                    letterSpacing: '0.5px',
                                }}
                            >
                                <Person sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
                                Usuario Responsable
                            </Typography>
                            {log.user ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar
                                        src={log.user.avatarUrl || undefined}
                                        sx={{
                                            bgcolor: '#2563eb',
                                            width: 42,
                                            height: 42,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {log.user.firstName?.[0]}
                                        {log.user.lastName?.[0]}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                            {log.user.firstName} {log.user.lastName}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                            {log.user.email}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '10px' }}
                                        >
                                            {log.userId}
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ bgcolor: '#94a3b8', width: 42, height: 42 }}>
                                        <Security />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                                            Sistema / Anónimo
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                            Operación interna o sin sesión activa
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Paper>

                        {/* 2. Technical Request Context */}
                        <Paper
                            variant="outlined"
                            sx={{ p: 2, borderColor: '#e2e8f0', borderRadius: 2 }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    textTransform: 'uppercase',
                                    fontWeight: 700,
                                    color: '#64748b',
                                    display: 'block',
                                    mb: 1.5,
                                    letterSpacing: '0.5px',
                                }}
                            >
                                <Http sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
                                Información de Request
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                        Fecha y Hora:
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Schedule sx={{ fontSize: 13, color: '#64748b' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                            {new Date(log.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                        Dirección IP:
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}
                                    >
                                        {details.ip || 'No registrada'}
                                    </Typography>
                                </Box>
                                {details.method && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                            Método y Ruta:
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#0284c7' }}
                                        >
                                            {details.method} {details.path || ''}
                                        </Typography>
                                    </Box>
                                )}
                                {details.userAgent && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="caption" sx={{ color: '#64748b', minWidth: 70 }}>
                                            User-Agent:
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            noWrap
                                            title={details.userAgent}
                                            sx={{
                                                maxWidth: 220,
                                                color: '#64748b',
                                                fontFamily: 'monospace',
                                                fontSize: '11px',
                                            }}
                                        >
                                            {details.userAgent}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Box>

                    {/* 3. Physical File Replacement Info (for Assets) */}
                    {fileReplaced && (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderColor: '#e0e7ff',
                                backgroundColor: '#f5f3ff',
                                borderRadius: 2,
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700, color: '#4338ca', mb: 1.5 }}
                            >
                                Reemplazo Físico de Archivo en Almacenamiento (R2)
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                <Box sx={{ p: 1.5, backgroundColor: '#ffffff', borderRadius: 1.5, border: '1px solid #e0e7ff' }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                        Archivo Anterior
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                        {fileReplaced.oldFileName || 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                        {fileReplaced.oldMimeType} • {formatBytes(fileReplaced.oldSizeBytes)}
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 1.5, backgroundColor: '#ffffff', borderRadius: 1.5, border: '1px solid #c7d2fe' }}>
                                    <Typography variant="caption" sx={{ color: '#4f46e5', fontWeight: 600, display: 'block' }}>
                                        Archivo Nuevo
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                        {fileReplaced.newFileName || 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                        {fileReplaced.newMimeType} • {formatBytes(fileReplaced.newSizeBytes)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    )}

                    {/* 4. Role Permissions Diff Section */}
                    {hasPermissionChanges && (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderColor: '#c7d2fe',
                                backgroundColor: '#f8faff',
                                borderRadius: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Security fontSize="small" sx={{ color: '#4f46e5' }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#312e81' }}>
                                        Actualización de Permisos del Rol {details.roleName ? `(${details.roleName})` : ''}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`${addedPermissions?.length || 0} agregados • ${removedPermissions?.length || 0} revocados`}
                                    size="small"
                                    sx={{ fontSize: '11px', fontWeight: 600, bgcolor: '#e0e7ff', color: '#3730a3' }}
                                />
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                {/* Added Permissions */}
                                <Box sx={{ p: 1.5, backgroundColor: '#ffffff', borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
                                    <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                        <Check sx={{ fontSize: 15 }} /> Permisos Agregados ({addedPermissions?.length || 0})
                                    </Typography>
                                    {addedPermissions && addedPermissions.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                            {addedPermissions.map((perm) => (
                                                <Chip
                                                    key={perm}
                                                    label={`✓ ${perm}`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#ecfdf5',
                                                        color: '#047857',
                                                        border: '1px solid #a7f3d0',
                                                        fontFamily: 'monospace',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                            Ninguno
                                        </Typography>
                                    )}
                                </Box>

                                {/* Removed Permissions */}
                                <Box sx={{ p: 1.5, backgroundColor: '#ffffff', borderRadius: 1.5, border: '1px solid #fecaca' }}>
                                    <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                        <Close sx={{ fontSize: 15 }} /> Permisos Revocados ({removedPermissions?.length || 0})
                                    </Typography>
                                    {removedPermissions && removedPermissions.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                            {removedPermissions.map((perm) => (
                                                <Chip
                                                    key={perm}
                                                    label={`✕ ${perm}`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#fef2f2',
                                                        color: '#b91c1c',
                                                        border: '1px solid #fecaca',
                                                        fontFamily: 'monospace',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                            Ninguno
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    )}

                    {/* 5. Changes Diff Table (for standard field updates) */}
                    {Object.keys(fieldChanges).length > 0 && (
                        <Paper variant="outlined" sx={{ borderColor: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                            <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CompareArrows fontSize="small" sx={{ color: '#0284c7' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                    Diferencias Registradas (Cambios)
                                </Typography>
                            </Box>
                            <TableContainer sx={{ maxHeight: 280 }}>
                                <Table size="small">
                                    <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, width: '25%' }}>Campo</TableCell>
                                            <TableCell sx={{ fontWeight: 700, width: '37.5%' }}>Valor Anterior</TableCell>
                                            <TableCell sx={{ fontWeight: 700, width: '37.5%' }}>Valor Nuevo</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(fieldChanges).map(([field, diff]) => (
                                            <TableRow key={field} hover>
                                                <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', color: '#334155' }}>
                                                    {field}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        color: '#991b1b',
                                                        backgroundColor: '#fef2f2',
                                                        fontFamily: 'monospace',
                                                        fontSize: '12px',
                                                        wordBreak: 'break-all',
                                                    }}
                                                >
                                                    {formatValue(diff.from)}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        color: '#065f46',
                                                        backgroundColor: '#ecfdf5',
                                                        fontFamily: 'monospace',
                                                        fontSize: '12px',
                                                        wordBreak: 'break-all',
                                                    }}
                                                >
                                                    {formatValue(diff.to)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}

                    {/* 5. Snapshot for DELETED resources */}
                    {deletedState && (
                        <Paper
                            variant="outlined"
                            sx={{ p: 2, borderColor: '#fecaca', backgroundColor: '#fef2f2', borderRadius: 2 }}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#b91c1c', mb: 1.5 }}>
                                Registro Eliminado (Snapshot previo)
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                                {Object.entries(deletedState).map(([k, v]) => (
                                    <Box key={k}>
                                        <Typography variant="caption" sx={{ color: '#7f1d1d', fontWeight: 600, display: 'block' }}>
                                            {k}:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#0f172a' }}>
                                            {formatValue(v)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    )}

                    {/* 6. Raw JSON Viewer (Collapsible) */}
                    <Paper variant="outlined" sx={{ borderColor: '#e2e8f0', borderRadius: 2 }}>
                        <Box
                            onClick={() => setRawDetailsOpen(!rawDetailsOpen)}
                            sx={{
                                p: 1.5,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#f8fafc',
                                '&:hover': { backgroundColor: '#f1f5f9' },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Code fontSize="small" sx={{ color: '#64748b' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155' }}>
                                    Detalles Completos en Formato JSON
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title={copied ? '¡Copiado!' : 'Copiar JSON'}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyJson();
                                        }}
                                    >
                                        {copied ? <Check fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                                {rawDetailsOpen ? <ExpandLess /> : <ExpandMore />}
                            </Box>
                        </Box>
                        <Collapse in={rawDetailsOpen}>
                            <Divider />
                            <Box
                                component="pre"
                                sx={{
                                    p: 2,
                                    m: 0,
                                    backgroundColor: '#0f172a',
                                    color: '#38bdf8',
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    maxHeight: 260,
                                    overflow: 'auto',
                                    borderRadius: '0 0 8px 8px',
                                }}
                            >
                                {JSON.stringify(details, null, 2)}
                            </Box>
                        </Collapse>
                    </Paper>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <Button onClick={onClose} variant="contained" sx={{ textTransform: 'none', px: 3, borderRadius: '8px' }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AuditLogDetailDialog;
