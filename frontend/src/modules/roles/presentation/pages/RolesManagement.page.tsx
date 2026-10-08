import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Chip,
    Typography,
    Snackbar,
    Alert,
    Stack,
    Tabs,
    Tab,
    Paper,
    CircularProgress,
} from '@mui/material';
import {
    AddModerator,
    Edit,
    Delete,
    Security,
    GridOn,
    PeopleAlt,
    Shield,
    Key,
} from '@mui/icons-material';
import { PageHeader } from '../../../../shared/components/common/PageHeader';
import { GoogleSearchBar } from '../../../../shared/components/common/GoogleSearchBar';
import ListTable, { type Column, type Action } from '../../../../shared/components/tables/ListTable';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import RoleFormDialog from '../components/RoleFormDialog';
import PermissionsMatrixGrid from '../components/PermissionsMatrixGrid';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission, hasSomePermission } from '../../../../core/utils/permissions';
import {
    getRolesPaginated,
    deleteRole,
    getPermissionsMatrix,
} from '../../infrastructure/services/roles.service';
import type { RoleItem, PermissionsMatrixData } from '../../domain/role.entity';

export const RolesManagementPage: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const canCreate = hasPermission(user, 'roles:create');
    const canUpdate = hasPermission(user, 'roles:update');
    const canDelete = hasPermission(user, 'roles:delete');
    const canManagePermissions = hasSomePermission(user, ['roles:permissions:update', 'roles:update', 'roles:read']);

    // Current Tab: 0 = Roles List, 1 = Permissions Matrix
    const [tabIndex, setTabIndex] = useState<number>(0);

    // Roles List States
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [q, setQ] = useState('');
    const [searchInputValue, setSearchInputValue] = useState('');
    const [loadingRoles, setLoadingRoles] = useState(false);

    // Matrix State
    const [matrixData, setMatrixData] = useState<PermissionsMatrixData | null>(null);
    const [loadingMatrix, setLoadingMatrix] = useState(false);
    const [focusedRoleId, setFocusedRoleId] = useState<string | null>(null);

    // Dialog States
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Feedback Toast
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const showNotification = useCallback((message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    // Fetch Roles
    const fetchRoles = useCallback(async () => {
        setLoadingRoles(true);
        try {
            const res = await getRolesPaginated(page + 1, limit, q || undefined);
            setRoles(res.data);
            setTotal(res.total);
        } catch {
            showNotification('Error al cargar los roles', 'error');
        } finally {
            setLoadingRoles(false);
        }
    }, [page, limit, q, showNotification]);

    // Fetch Matrix Data
    const fetchMatrix = useCallback(async () => {
        setLoadingMatrix(true);
        try {
            const res = await getPermissionsMatrix();
            setMatrixData(res);
        } catch {
            showNotification('Error al cargar la matriz de permisos', 'error');
        } finally {
            setLoadingMatrix(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (tabIndex === 0) {
            fetchRoles();
        } else if (tabIndex === 1) {
            fetchMatrix();
        }
    }, [tabIndex, fetchRoles, fetchMatrix]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setQ(searchInputValue);
    };

    const handleOpenCreate = () => {
        setSelectedRole(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (role: RoleItem) => {
        setSelectedRole(role);
        setFormDialogOpen(true);
    };

    const handleManagePermissions = (role: RoleItem) => {
        setFocusedRoleId(role.id);
        setTabIndex(1);
    };

    const handleConfirmDelete = async () => {
        if (!roleToDelete) return;
        setIsProcessing(true);
        try {
            await deleteRole(roleToDelete.id);
            showNotification(`Rol "${roleToDelete.name}" eliminado correctamente`, 'success');
            setRoleToDelete(null);
            fetchRoles();
            if (matrixData) {
                fetchMatrix();
            }
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Error al eliminar el rol', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // Table Columns
    const columns: Column[] = [
        {
            id: 'name',
            name: 'Nombre del Rol',
            format: (_: any, row: RoleItem) => (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: row.isSystem ? '#f1f5f9' : '#eff6ff',
                            color: row.isSystem ? '#475569' : '#2563eb',
                        }}
                    >
                        {row.isSystem ? <Shield fontSize="small" /> : <Security fontSize="small" />}
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                                {row.name}
                            </Typography>
                            {row.isSystem && (
                                <Chip
                                    label="SISTEMA"
                                    size="small"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: '9px',
                                        height: 18,
                                        backgroundColor: '#e2e8f0',
                                        color: '#334155',
                                    }}
                                />
                            )}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {row.description || 'Sin descripción'}
                        </Typography>
                    </Box>
                </Stack>
            ),
        },
        {
            id: 'type',
            name: 'Tipo de Rol',
            format: (_: any, row: RoleItem) => (
                <Chip
                    size="small"
                    label={row.isSystem ? 'Sistema (Fijo)' : 'Personalizado'}
                    color={row.isSystem ? 'default' : 'primary'}
                    variant={row.isSystem ? 'outlined' : 'filled'}
                    sx={{
                        fontWeight: 600,
                        fontSize: '11px',
                        height: 22,
                    }}
                />
            ),
        },
        {
            id: 'permissionsCount',
            name: 'Permisos',
            format: (_: any, row: RoleItem) => (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Key sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {row._count?.rolePermissions ?? 0}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#64748b' }}>asignados</Typography>
                </Stack>
            ),
        },
        {
            id: 'usersCount',
            name: 'Usuarios',
            format: (_: any, row: RoleItem) => (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <PeopleAlt sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {row._count?.userRoles ?? 0}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#64748b' }}>asociados</Typography>
                </Stack>
            ),
        },
        {
            id: 'createdAt',
            name: 'Fecha de Creación',
            format: (value: string) => (
                <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(value).toLocaleDateString()}
                </Typography>
            ),
        },
    ];

    // Table Actions
    const actions: Action[] = [
        {
            name: 'Gestionar Permisos',
            icon: <Key fontSize="small" />,
            color: '#2563eb',
            visible: () => canManagePermissions,
            onClick: (row: RoleItem) => handleManagePermissions(row),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            visible: () => canUpdate,
            onClick: (row: RoleItem) => handleOpenEdit(row),
        },
        {
            name: 'Eliminar',
            icon: <Delete fontSize="small" />,
            color: '#ef4444',
            visible: (row: RoleItem) => !row.isSystem && canDelete,
            onClick: (row: RoleItem) => setRoleToDelete(row),
        },
    ];

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            <PageHeader
                title="Roles y Permisos"
                subtitle="Administra los perfiles de acceso y configura granularmente la matriz de permisos de seguridad"
                actionLabel={canCreate ? "Nuevo Rol" : undefined}
                actionIcon={canCreate ? <AddModerator /> : undefined}
                onAction={canCreate ? handleOpenCreate : undefined}
            />

            {/* Navigation Tabs */}
            <Paper
                variant="outlined"
                sx={{
                    mb: 3,
                    borderRadius: 2.5,
                    borderColor: '#e2e8f0',
                    backgroundColor: '#ffffff',
                }}
            >
                <Tabs
                    value={tabIndex}
                    onChange={(_, val) => setTabIndex(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        px: { xs: 0.5, sm: 2 },
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                            minHeight: 48,
                            gap: 1,
                            whiteSpace: 'nowrap',
                        },
                    }}
                >
                    <Tab icon={<Security sx={{ fontSize: 18 }} />} label="Catálogo de Roles" iconPosition="start" />
                    <Tab
                        icon={<GridOn sx={{ fontSize: 18 }} />}
                        label="Cuadrícula de Permisos (Matriz)"
                        iconPosition="start"
                    />
                </Tabs>
            </Paper>

            {/* TAB 0: ROLES LIST */}
            {tabIndex === 0 && (
                <Box>
                    <GoogleSearchBar
                        value={searchInputValue}
                        onChange={(val) => {
                            setSearchInputValue(val);
                            if (!val && q) {
                                setPage(0);
                                setQ('');
                            }
                        }}
                        onSubmit={handleSearchSubmit}
                        placeholder="Buscar rol por nombre o descripción..."
                        loading={loadingRoles}
                    />

                    <ListTable
                        data={roles}
                        columns={columns}
                        actions={actions}
                        emptyMessage="No se encontraron roles en el sistema"
                        pagination={{
                            total,
                            limit,
                            offset: page * limit,
                            onPageChange: (newPage) => setPage(newPage),
                            onRowsPerPageChange: (newLimit) => {
                                setLimit(newLimit);
                                setPage(0);
                            },
                        }}
                    />
                </Box>
            )}

            {/* TAB 1: PERMISSIONS MATRIX GRID */}
            {tabIndex === 1 && (
                <Box>
                    {loadingMatrix && !matrixData ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                            <CircularProgress size={40} />
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                Cargando catálogo y matriz de permisos...
                            </Typography>
                        </Box>
                    ) : matrixData ? (
                        <PermissionsMatrixGrid
                            data={matrixData}
                            onRefresh={() => {
                                fetchMatrix();
                                fetchRoles();
                            }}
                            showNotification={showNotification}
                            highlightRoleId={focusedRoleId}
                        />
                    ) : (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                            No se pudo cargar la información de la matriz de permisos.
                        </Alert>
                    )}
                </Box>
            )}

            {/* Create / Edit Dialog */}
            <RoleFormDialog
                open={formDialogOpen}
                onClose={() => setFormDialogOpen(false)}
                onSuccess={() => {
                    showNotification(
                        selectedRole ? 'Rol actualizado correctamente' : 'Rol creado exitosamente',
                        'success'
                    );
                    fetchRoles();
                    if (matrixData) {
                        fetchMatrix();
                    }
                }}
                initialData={selectedRole}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={Boolean(roleToDelete)}
                title="¿Eliminar Rol?"
                description={
                    <span>
                        ¿Estás seguro de que deseas eliminar permanentemente el rol{' '}
                        <strong>{roleToDelete?.name}</strong>? Esta acción no se puede deshacer y revocará
                        sus permisos asociados.
                    </span>
                }
                onClose={() => setRoleToDelete(null)}
                onConfirm={handleConfirmDelete}
                isLoading={isProcessing}
                confirmText="Eliminar Rol"
                confirmColor="error"
            />

            {/* Notification Toast */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4500}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RolesManagementPage;
