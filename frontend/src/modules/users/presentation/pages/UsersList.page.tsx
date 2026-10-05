import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Chip,
    Typography,
    Snackbar,
    Alert,
    Avatar,
    Stack,
} from '@mui/material';
import {
    PersonAdd,
    Edit,
    Delete,
    Block,
} from '@mui/icons-material';
import { PageHeader } from '../../../../shared/components/common/PageHeader';
import { GoogleSearchBar } from '../../../../shared/components/common/GoogleSearchBar';
import ListTable, { type Column, type Action } from '../../../../shared/components/tables/ListTable';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import UserFormDialog from '../components/UserFormDialog';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import {
    getUsersPaginated,
    disableUser,
    deleteUser,
} from '../../infrastructure/services/users.service';
import type { UserDto } from '../../domain/dto/users.dto';

export const UsersListPage: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const canCreate = hasPermission(user, 'users:create');
    const canUpdate = hasPermission(user, 'users:update');
    const canDelete = hasPermission(user, 'users:delete');

    const [users, setUsers] = useState<UserDto[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [q, setQ] = useState('');
    const [searchInputValue, setSearchInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    // Dialog states
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);
    const [userToDisable, setUserToDisable] = useState<UserDto | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Feedback toast
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getUsersPaginated(page + 1, limit, q || undefined);
            setUsers(res.data);
            setTotal(res.total);
        } catch {
            setSnackbar({
                open: true,
                message: 'Failed to load users',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [page, limit, q]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setQ(searchInputValue);
    };

    const handleOpenCreate = () => {
        setSelectedUser(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (user: UserDto) => {
        setSelectedUser(user);
        setFormDialogOpen(true);
    };

    const handleConfirmDisable = async () => {
        if (!userToDisable) return;
        setIsProcessing(true);
        try {
            await disableUser(userToDisable.id);
            setSnackbar({
                open: true,
                message: 'User account disabled successfully',
                severity: 'success',
            });
            setUserToDisable(null);
            fetchUsers();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to disable user',
                severity: 'error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        setIsProcessing(true);
        try {
            await deleteUser(userToDelete.id);
            setSnackbar({
                open: true,
                message: 'User deleted successfully',
                severity: 'success',
            });
            setUserToDelete(null);
            fetchUsers();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete user',
                severity: 'error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const columns: Column[] = [
        {
            id: 'fullName',
            name: 'User Name',
            format: (_: any, row: UserDto) => {
                const fullName = `${row.firstName} ${row.lastName}`.trim();
                const initials = fullName
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'U';

                return (
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                fontSize: '12px',
                                fontWeight: 600,
                                bgcolor: row.isActive ? '#006bff' : '#94a3b8',
                            }}
                        >
                            {initials}
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '13px', color: 'text.primary' }}>
                                {fullName}
                            </Typography>
                        </Box>
                    </Stack>
                );
            },
        },
        {
            id: 'email',
            name: 'Email Address',
            format: (value: string) => (
                <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
                    {value}
                </Typography>
            ),
        },
        {
            id: 'roles',
            name: 'Roles',
            format: (_: any, row: UserDto) => (
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {row.roles && row.roles.length > 0 ? (
                        row.roles.map((role) => (
                            <Chip
                                key={role}
                                size="small"
                                label={role}
                                color={
                                    role === 'SUPER_ADMIN'
                                        ? 'error'
                                        : role === 'ADMIN'
                                        ? 'primary'
                                        : 'default'
                                }
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '10px',
                                    height: 20,
                                }}
                            />
                        ))
                    ) : (
                        <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>—</Typography>
                    )}
                </Stack>
            ),
        },
        {
            id: 'status',
            name: 'Account Status',
            format: (_: any, row: UserDto) => (
                <Chip
                    size="small"
                    label={row.isActive ? 'Active' : 'Disabled'}
                    color={row.isActive ? 'success' : 'default'}
                    sx={{
                        fontWeight: 600,
                        fontSize: '11px',
                        height: 22,
                    }}
                />
            ),
        },
    ];

    const actions: Action[] = [
        {
            name: 'Edit',
            icon: <Edit fontSize="small" />,
            visible: () => canUpdate,
            onClick: (row: UserDto) => handleOpenEdit(row),
        },
        {
            name: 'Disable Account',
            icon: <Block fontSize="small" />,
            color: '#eab308',
            visible: (row: UserDto) => row.isActive && canUpdate,
            onClick: (row: UserDto) => setUserToDisable(row),
        },
        {
            name: 'Delete User',
            icon: <Delete fontSize="small" />,
            color: '#ef4444',
            visible: () => canDelete,
            onClick: (row: UserDto) => setUserToDelete(row),
        },
    ];

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            <PageHeader
                title="Users Management"
                subtitle="Directory of authenticated users, security access, and account statuses"
                actionLabel={canCreate ? "New User" : undefined}
                actionIcon={canCreate ? <PersonAdd /> : undefined}
                onAction={canCreate ? handleOpenCreate : undefined}
            />

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
                placeholder="Search users by name or email..."
                loading={loading}
            />

            <ListTable
                data={users}
                columns={columns}
                actions={actions}
                emptyMessage="No users found"
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

            {/* Create / Edit User Dialog */}
            <UserFormDialog
                open={formDialogOpen}
                onClose={() => setFormDialogOpen(false)}
                onSuccess={() => {
                    setSnackbar({
                        open: true,
                        message: selectedUser ? 'User updated successfully' : 'User created successfully',
                        severity: 'success',
                    });
                    fetchUsers();
                }}
                initialData={selectedUser}
            />

            {/* Disable Account Confirmation Dialog */}
            <ConfirmDialog
                open={Boolean(userToDisable)}
                title="Disable User Account?"
                description={
                    <span>
                        Are you sure you want to disable account access for <strong>{userToDisable?.firstName} {userToDisable?.lastName}</strong> ({userToDisable?.email})?
                    </span>
                }
                onClose={() => setUserToDisable(null)}
                onConfirm={handleConfirmDisable}
                isLoading={isProcessing}
                confirmText="Disable Account"
                confirmColor="warning"
            />

            {/* Delete User Confirmation Dialog */}
            <ConfirmDialog
                open={Boolean(userToDelete)}
                title="Delete User?"
                description={
                    <span>
                        Are you sure you want to permanently delete <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>? This action cannot be undone.
                    </span>
                }
                onClose={() => setUserToDelete(null)}
                onConfirm={handleConfirmDelete}
                isLoading={isProcessing}
                confirmText="Delete"
                confirmColor="error"
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
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

export default UsersListPage;
