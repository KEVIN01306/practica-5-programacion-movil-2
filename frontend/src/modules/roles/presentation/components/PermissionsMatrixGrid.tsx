import React, { useState, useMemo, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Checkbox,
    Button,
    Chip,
    Stack,
    TextField,
    InputAdornment,
    Tooltip,
    CircularProgress,
    IconButton,
} from '@mui/material';
import {
    Search,
    Save,
    RestartAlt,
    Shield,
    DoneAll,
    RemoveDone,
} from '@mui/icons-material';
import type { PermissionItem, PermissionsMatrixData } from '../../domain/role.entity';
import { updateRolePermissions } from '../../infrastructure/services/roles.service';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasSomePermission } from '../../../../core/utils/permissions';

interface PermissionsMatrixGridProps {
    data: PermissionsMatrixData;
    onRefresh: () => void;
    showNotification: (message: string, severity: 'success' | 'error') => void;
    highlightRoleId?: string | null;
}

// Module human-friendly labels and colors
const MODULE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    users: { label: 'Usuarios', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    roles: { label: 'Roles y Permisos', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
    brands: { label: 'Marcas', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    folders: { label: 'Directorios', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    assets: { label: 'Archivos y Multimedia', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    audit: { label: 'Auditoría', color: '#b45309', bg: '#fefce8', border: '#fef08a' },
};

export const PermissionsMatrixGrid: React.FC<PermissionsMatrixGridProps> = ({
    data,
    onRefresh,
    showNotification,
    highlightRoleId,
}) => {
    const user = useAuthStore((state) => state.user);
    const canUpdatePermissions = hasSomePermission(user, ['roles:permissions:update', 'roles:update']);

    const { roles, permissions, assignments } = data;

    // Build the initial mapping: roleId -> Set<permissionId>
    const initialAssignmentMap = useMemo(() => {
        const map = new Map<string, Set<string>>();
        roles.forEach((r) => map.set(r.id, new Set<string>()));
        assignments.forEach((a) => {
            if (map.has(a.roleId)) {
                map.get(a.roleId)!.add(a.permissionId);
            }
        });
        return map;
    }, [roles, assignments]);

    // Local state tracking of current assignments: roleId -> Set<permissionId>
    const [currentAssignmentMap, setCurrentAssignmentMap] = useState<Map<string, Set<string>>>(() => {
        const clone = new Map<string, Set<string>>();
        initialAssignmentMap.forEach((permSet, roleId) => {
            clone.set(roleId, new Set(permSet));
        });
        return clone;
    });

    // Reset local state if data changes from outside
    React.useEffect(() => {
        const clone = new Map<string, Set<string>>();
        initialAssignmentMap.forEach((permSet, roleId) => {
            clone.set(roleId, new Set(permSet));
        });
        setCurrentAssignmentMap(clone);
    }, [initialAssignmentMap]);

    // Filter search text
    const [searchText, setSearchText] = useState('');
    const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
    const [isSaving, setIsSaving] = useState(false);

    // Compute which roles have unsaved pending changes
    const modifiedRoleIds = useMemo(() => {
        const changed: string[] = [];
        roles.forEach((r) => {
            const initialSet = initialAssignmentMap.get(r.id) || new Set();
            const currentSet = currentAssignmentMap.get(r.id) || new Set();

            if (initialSet.size !== currentSet.size) {
                changed.push(r.id);
                return;
            }

            for (const id of currentSet) {
                if (!initialSet.has(id)) {
                    changed.push(r.id);
                    return;
                }
            }
        });
        return changed;
    }, [roles, initialAssignmentMap, currentAssignmentMap]);

    const hasPendingChanges = modifiedRoleIds.length > 0;

    // Group permissions robustly by module prefix
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, PermissionItem[]> = {};

        permissions.forEach((perm) => {
            let moduleKey = 'general';
            if (perm.action.includes(':')) {
                moduleKey = perm.action.split(':')[0].toLowerCase();
            } else if (perm.action.includes('.')) {
                moduleKey = perm.action.split('.')[0].toLowerCase();
            } else if (perm.action.includes('_')) {
                moduleKey = perm.action.split('_')[0].toLowerCase();
            }

            if (!groups[moduleKey]) {
                groups[moduleKey] = [];
            }
            groups[moduleKey].push(perm);
        });

        return groups;
    }, [permissions]);

    // Available module keys
    const moduleKeys = useMemo(() => Object.keys(groupedPermissions).sort(), [groupedPermissions]);

    // Filtered permissions list
    const filteredGroupedPermissions = useMemo(() => {
        const result: Record<string, PermissionItem[]> = {};
        const query = searchText.trim().toLowerCase();

        Object.entries(groupedPermissions).forEach(([moduleKey, perms]) => {
            if (selectedModuleFilter !== 'all' && selectedModuleFilter !== moduleKey) {
                return;
            }

            const matched = perms.filter((p) => {
                if (!query) return true;
                return (
                    p.action.toLowerCase().includes(query) ||
                    (p.description && p.description.toLowerCase().includes(query))
                );
            });

            if (matched.length > 0) {
                result[moduleKey] = matched;
            }
        });

        return result;
    }, [groupedPermissions, searchText, selectedModuleFilter]);

    // Toggle a single permission for a role
    const handleToggle = useCallback((roleId: string, permissionId: string) => {
        setCurrentAssignmentMap((prev) => {
            const next = new Map(prev);
            const currentSet = new Set(next.get(roleId) || []);
            if (currentSet.has(permissionId)) {
                currentSet.delete(permissionId);
            } else {
                currentSet.add(permissionId);
            }
            next.set(roleId, currentSet);
            return next;
        });
    }, []);

    // Select or deselect all visible permissions for a role
    const handleBulkRoleAction = useCallback((roleId: string, selectAll: boolean) => {
        setCurrentAssignmentMap((prev) => {
            const next = new Map(prev);
            const currentSet = new Set(next.get(roleId) || []);

            // Gather all visible permission IDs
            const visiblePermIds: string[] = [];
            Object.values(filteredGroupedPermissions).forEach((pList) => {
                pList.forEach((p) => visiblePermIds.push(p.id));
            });

            visiblePermIds.forEach((pId) => {
                if (selectAll) {
                    currentSet.add(pId);
                } else {
                    currentSet.delete(pId);
                }
            });

            next.set(roleId, currentSet);
            return next;
        });
    }, [filteredGroupedPermissions]);

    // Select or deselect all roles for a single permission
    const handleBulkPermissionRowAction = useCallback((permissionId: string, selectAll: boolean) => {
        setCurrentAssignmentMap((prev) => {
            const next = new Map(prev);
            roles.forEach((r) => {
                const currentSet = new Set(next.get(r.id) || []);
                if (selectAll) {
                    currentSet.add(permissionId);
                } else {
                    currentSet.delete(permissionId);
                }
                next.set(r.id, currentSet);
            });
            return next;
        });
    }, [roles]);

    // Discard changes
    const handleDiscard = () => {
        const clone = new Map<string, Set<string>>();
        initialAssignmentMap.forEach((permSet, roleId) => {
            clone.set(roleId, new Set(permSet));
        });
        setCurrentAssignmentMap(clone);
        showNotification('Cambios descartados', 'success');
    };

    // Save changes for all modified roles
    const handleSave = async () => {
        if (!hasPendingChanges) return;

        setIsSaving(true);
        try {
            // Update each modified role concurrently
            await Promise.all(
                modifiedRoleIds.map((roleId) => {
                    const permIds = Array.from(currentAssignmentMap.get(roleId) || []);
                    return updateRolePermissions(roleId, { permissionIds: permIds });
                })
            );

            showNotification(
                `Permisos actualizados con éxito para ${modifiedRoleIds.length} rol(es)`,
                'success'
            );
            onRefresh();
        } catch (err: any) {
            showNotification(
                err.response?.data?.message || 'Error al guardar los cambios de permisos',
                'error'
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Top Toolbar: Search & Module Filters */}
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor: '#e2e8f0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    backgroundColor: '#ffffff',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: '1 1 300px' }}>
                    <TextField
                        size="small"
                        placeholder="Buscar por acción o descripción (ej: users:create, eliminar)..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        fullWidth
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: '#94a3b8', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc',
                            },
                        }}
                    />
                </Box>

                {/* Module Quick Filter Chips */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                        label="Todos los Módulos"
                        size="small"
                        onClick={() => setSelectedModuleFilter('all')}
                        color={selectedModuleFilter === 'all' ? 'primary' : 'default'}
                        variant={selectedModuleFilter === 'all' ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600, fontSize: '11px', cursor: 'pointer' }}
                    />
                    {moduleKeys.map((k) => {
                        const conf = MODULE_CONFIG[k] || { label: k.toUpperCase(), color: '#475569' };
                        const isSelected = selectedModuleFilter === k;
                        return (
                            <Chip
                                key={k}
                                label={conf.label}
                                size="small"
                                onClick={() => setSelectedModuleFilter(isSelected ? 'all' : k)}
                                color={isSelected ? 'primary' : 'default'}
                                variant={isSelected ? 'filled' : 'outlined'}
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                }}
                            />
                        );
                    })}
                </Box>
            </Paper>

            {/* Floating / Sticky Alert when changes are pending */}
            {hasPendingChanges && canUpdatePermissions && (
                <Paper
                    elevation={4}
                    sx={{
                        p: 2,
                        borderRadius: 2.5,
                        backgroundColor: '#1e293b',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                        position: 'sticky',
                        top: 16,
                        zIndex: 20,
                        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: '#f59e0b',
                                animation: 'pulse 1.5s infinite',
                            }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Tienes cambios pendientes sin guardar en{' '}
                            <strong>{modifiedRoleIds.length}</strong> rol(es).
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1.5}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleDiscard}
                            disabled={isSaving}
                            startIcon={<RestartAlt />}
                            sx={{
                                color: '#94a3b8',
                                borderColor: '#475569',
                                textTransform: 'none',
                                borderRadius: 2,
                                '&:hover': {
                                    borderColor: '#cbd5e1',
                                    color: '#ffffff',
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                },
                            }}
                        >
                            Descartar
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleSave}
                            disabled={isSaving}
                            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                            sx={{
                                bgcolor: '#2563eb',
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 2.5,
                                fontWeight: 600,
                                '&:hover': { bgcolor: '#1d4ed8' },
                            }}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </Stack>
                </Paper>
            )}

            {/* Matrix Table Container with Sticky Column & Horizontal Scroll */}
            <Paper
                variant="outlined"
                sx={{
                    borderRadius: 3,
                    borderColor: '#e2e8f0',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                }}
            >
                <Box sx={{ overflowX: 'auto', maxHeight: '75vh' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'separate',
                            borderSpacing: 0,
                            fontFamily: 'inherit',
                        }}
                    >
                        {/* Table Header: Roles Horizontally */}
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                {/* Sticky Top-Left Corner Cell */}
                                <th
                                    style={{
                                        position: 'sticky',
                                        left: 0,
                                        top: 0,
                                        zIndex: 12,
                                        backgroundColor: '#f8fafc',
                                        padding: '16px 20px',
                                        textAlign: 'left',
                                        borderBottom: '2px solid #e2e8f0',
                                        borderRight: '2px solid #e2e8f0',
                                        minWidth: 320,
                                        maxWidth: 360,
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                        PERMISOS DEL SISTEMA
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                        Total: {permissions.length} permisos
                                    </Typography>
                                </th>

                                {/* Role Columns */}
                                {roles.map((role) => {
                                    const isHighlighted = highlightRoleId === role.id;
                                    const isModified = modifiedRoleIds.includes(role.id);
                                    const assignedCount = currentAssignmentMap.get(role.id)?.size || 0;

                                    return (
                                        <th
                                            key={role.id}
                                            style={{
                                                padding: '14px 16px',
                                                textAlign: 'center',
                                                borderBottom: '2px solid #e2e8f0',
                                                borderRight: '1px solid #e2e8f0',
                                                minWidth: 160,
                                                backgroundColor: isHighlighted
                                                    ? '#eff6ff'
                                                    : isModified
                                                        ? '#fefce8'
                                                        : '#f8fafc',
                                                transition: 'background-color 0.2s',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: '#0f172a',
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        {role.name}
                                                    </Typography>
                                                    {role.isSystem && (
                                                        <Tooltip title="Rol del sistema: Protegido contra eliminación">
                                                            <Chip
                                                                label="SISTEMA"
                                                                size="small"
                                                                icon={<Shield sx={{ fontSize: '12px !important' }} />}
                                                                sx={{
                                                                    height: 18,
                                                                    fontSize: '9px',
                                                                    fontWeight: 700,
                                                                    bgcolor: '#e2e8f0',
                                                                    color: '#334155',
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </Box>

                                                {role.description && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#64748b',
                                                            fontSize: '11px',
                                                            maxWidth: 160,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 1,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }}
                                                        title={role.description}
                                                    >
                                                        {role.description}
                                                    </Typography>
                                                )}

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <Chip
                                                        label={`${assignedCount} / ${permissions.length}`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '10px',
                                                            fontWeight: 600,
                                                            borderColor: '#cbd5e1',
                                                        }}
                                                    />

                                                    {/* Quick Select/Deselect All buttons for this role */}
                                                    {canUpdatePermissions && (
                                                        <>
                                                            <Tooltip title="Marcar todos los visibles">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleBulkRoleAction(role.id, true)}
                                                                    sx={{ p: 0.5, color: '#0284c7' }}
                                                                >
                                                                    <DoneAll sx={{ fontSize: 16 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Desmarcar todos los visibles">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleBulkRoleAction(role.id, false)}
                                                                    sx={{ p: 0.5, color: '#ef4444' }}
                                                                >
                                                                    <RemoveDone sx={{ fontSize: 16 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </Box>

                                                {isModified && (
                                                    <Chip
                                                        label="Modificado"
                                                        size="small"
                                                        color="warning"
                                                        sx={{ height: 16, fontSize: '9px', fontWeight: 700 }}
                                                    />
                                                )}
                                            </Box>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        {/* Table Body: Grouped Permissions (Vertical) */}
                        <tbody>
                            {Object.keys(filteredGroupedPermissions).length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={roles.length + 1}
                                        style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}
                                    >
                                        <Typography variant="body2">
                                            No se encontraron permisos que coincidan con los filtros aplicados.
                                        </Typography>
                                    </td>
                                </tr>
                            ) : (
                                Object.entries(filteredGroupedPermissions).map(([moduleKey, perms]) => {
                                    const conf = MODULE_CONFIG[moduleKey] || {
                                        label: moduleKey.toUpperCase(),
                                        color: '#334155',
                                        bg: '#f1f5f9',
                                        border: '#cbd5e1',
                                    };

                                    return (
                                        <React.Fragment key={moduleKey}>
                                            {/* Module Section Banner Row */}
                                            <tr>
                                                <td
                                                    colSpan={roles.length + 1}
                                                    style={{
                                                        backgroundColor: conf.bg,
                                                        padding: '10px 20px',
                                                        borderTop: `1px solid ${conf.border}`,
                                                        borderBottom: `1px solid ${conf.border}`,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontWeight: 800,
                                                                letterSpacing: '0.8px',
                                                                color: conf.color,
                                                                textTransform: 'uppercase',
                                                            }}
                                                        >
                                                            MÓDULO: {conf.label}
                                                        </Typography>
                                                        <Chip
                                                            label={`${perms.length} permisos`}
                                                            size="small"
                                                            sx={{
                                                                height: 18,
                                                                fontSize: '10px',
                                                                fontWeight: 700,
                                                                bgcolor: '#ffffff',
                                                                color: conf.color,
                                                                border: `1px solid ${conf.border}`,
                                                            }}
                                                        />
                                                    </Box>
                                                </td>
                                            </tr>

                                            {/* Individual Permission Rows */}
                                            {perms.map((perm) => (
                                                <tr
                                                    key={perm.id}
                                                    style={{
                                                        borderBottom: '1px solid #f1f5f9',
                                                        transition: 'background-color 0.15s',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    {/* Sticky Left Column: Permission Identifier & Description */}
                                                    <td
                                                        style={{
                                                            position: 'sticky',
                                                            left: 0,
                                                            zIndex: 5,
                                                            backgroundColor: '#ffffff',
                                                            padding: '10px 20px',
                                                            borderRight: '2px solid #e2e8f0',
                                                            borderBottom: '1px solid #f1f5f9',
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                                            <Box>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontFamily: 'monospace',
                                                                        fontWeight: 600,
                                                                        color: '#0f172a',
                                                                        fontSize: '13px',
                                                                    }}
                                                                >
                                                                    {perm.action}
                                                                </Typography>
                                                                {perm.description && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{ color: '#64748b', display: 'block', fontSize: '11px' }}
                                                                    >
                                                                        {perm.description}
                                                                    </Typography>
                                                                )}
                                                            </Box>

                                                            {/* Quick action: mark this permission for all roles */}
                                                            {canUpdatePermissions && (
                                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                    <Tooltip title="Asignar este permiso a todos los roles">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleBulkPermissionRowAction(perm.id, true)}
                                                                            sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#0284c7' } }}
                                                                        >
                                                                            <DoneAll sx={{ fontSize: 14 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Remover este permiso de todos los roles">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleBulkPermissionRowAction(perm.id, false)}
                                                                            sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                                                                        >
                                                                            <RemoveDone sx={{ fontSize: 14 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </td>

                                                    {/* Role Checkboxes Intersections */}
                                                    {roles.map((role) => {
                                                        const isChecked = Boolean(
                                                            currentAssignmentMap.get(role.id)?.has(perm.id)
                                                        );
                                                        const isRoleModified = modifiedRoleIds.includes(role.id);

                                                        return (
                                                            <td
                                                                key={`${role.id}-${perm.id}`}
                                                                style={{
                                                                    textAlign: 'center',
                                                                    padding: '6px 12px',
                                                                    borderRight: '1px solid #f1f5f9',
                                                                    borderBottom: '1px solid #f1f5f9',
                                                                    backgroundColor: isChecked
                                                                        ? 'rgba(37, 99, 235, 0.03)'
                                                                        : 'transparent',
                                                                }}
                                                            >
                                                                <Tooltip
                                                                    title={
                                                                        !canUpdatePermissions
                                                                            ? `${role.name}: ${isChecked ? 'Permitido' : 'No permitido'}`
                                                                            : `${role.name}: ${isChecked ? 'Permitido (Click para revocar)' : 'No permitido (Click para otorgar)'}`
                                                                    }
                                                                >
                                                                    <span>
                                                                        <Checkbox
                                                                            checked={isChecked}
                                                                            disabled={!canUpdatePermissions}
                                                                            onChange={() => handleToggle(role.id, perm.id)}
                                                                            color="primary"
                                                                            sx={{
                                                                                p: 0.5,
                                                                                '&.Mui-checked': {
                                                                                    color: isRoleModified ? '#d97706' : '#2563eb',
                                                                                },
                                                                            }}
                                                                        />
                                                                    </span>
                                                                </Tooltip>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </Box>
            </Paper>
        </Box>
    );
};

export default PermissionsMatrixGrid;
