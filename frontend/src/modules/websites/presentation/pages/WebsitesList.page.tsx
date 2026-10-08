import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Chip,
    Typography,
    Snackbar,
    Alert,
    IconButton,
    Tooltip,
    Stack,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Visibility,
    Key,
    OpenInNew,
    CheckCircle,
    Cancel,
    Storage,
} from '@mui/icons-material';
import { PageHeader } from '../../../../shared/components/common/PageHeader';
import { GoogleSearchBar } from '../../../../shared/components/common/GoogleSearchBar';
import ListTable, { type Column, type Action } from '../../../../shared/components/tables/ListTable';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import WebsiteFormDialog from '../components/WebsiteFormDialog';
import WebsiteFavicon from '../../../../shared/components/common/WebsiteFavicon';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import {
    getWebsitesPaginated,
    deleteWebsite,
    regenerateWebsiteApiKey,
    updateWebsite,
} from '../../infrastructure/services/websites.service';
import type { WebsiteDto } from '../../domain/dto/websites.dto';

export const WebsitesListPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const canCreate = hasPermission(user, 'websites:create');
    const canUpdate = hasPermission(user, 'websites:update');
    const canDelete = hasPermission(user, 'websites:delete');

    const [websites, setWebsites] = useState<WebsiteDto[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [searchInputValue, setSearchInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    // Dialog states
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [selectedWebsite, setSelectedWebsite] = useState<WebsiteDto | null>(null);
    const [websiteToDelete, setWebsiteToDelete] = useState<WebsiteDto | null>(null);
    const [websiteToRegenerateKey, setWebsiteToRegenerateKey] = useState<WebsiteDto | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Feedback toast
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const fetchWebsites = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getWebsitesPaginated(page + 1, limit, search || undefined);
            setWebsites(res.data);
            setTotal(res.total);
        } catch {
            setSnackbar({
                open: true,
                message: 'Failed to load websites',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        fetchWebsites();
    }, [fetchWebsites]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setSearch(searchInputValue);
    };

    const handleOpenCreate = () => {
        setSelectedWebsite(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (w: WebsiteDto) => {
        setSelectedWebsite(w);
        setFormDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!websiteToDelete) return;
        setIsProcessing(true);
        try {
            await deleteWebsite(websiteToDelete.id);
            setSnackbar({
                open: true,
                message: `Website "${websiteToDelete.name}" deleted successfully`,
                severity: 'success',
            });
            setWebsiteToDelete(null);
            fetchWebsites();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete website',
                severity: 'error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmRegenerateKey = async () => {
        if (!websiteToRegenerateKey) return;
        setIsProcessing(true);
        try {
            await regenerateWebsiteApiKey(websiteToRegenerateKey.id);
            setSnackbar({
                open: true,
                message: `API Key regenerated for "${websiteToRegenerateKey.name}"`,
                severity: 'success',
            });
            setWebsiteToRegenerateKey(null);
            fetchWebsites();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to regenerate API key',
                severity: 'error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleToggleActive = async (w: WebsiteDto) => {
        if (!canUpdate) return;
        try {
            await updateWebsite(w.id, { isActive: !w.isActive });
            setSnackbar({
                open: true,
                message: `Website "${w.name}" is now ${!w.isActive ? 'Active' : 'Inactive'}`,
                severity: 'success',
            });
            fetchWebsites();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to update website status',
                severity: 'error',
            });
        }
    };

    const columns: Column[] = [
        {
            id: 'name',
            name: 'Website & Domain',
            format: (_: any, row: WebsiteDto) => (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <WebsiteFavicon domain={row.domain} name={row.name} size={36} />
                    <Box>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: 'primary.main',
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' },
                            }}
                            onClick={() => navigate(`/websites/${row.id}`)}
                        >
                            {row.name}
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.25, alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                {row.domain}
                            </Typography>
                            <Tooltip title="Open external domain">
                                <IconButton
                                    size="small"
                                    component="a"
                                    href={`https://${row.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ p: 0.25, color: 'text.secondary' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <OpenInNew sx={{ fontSize: 13 }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                </Stack>
            ),
        },
        {
            id: 'hostingProvider',
            name: 'Hosting',
            format: (value: string | null) => (
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    <Storage sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: value ? 'text.primary' : 'text.secondary', fontSize: '13px' }}>
                        {value || 'Not specified'}
                    </Typography>
                </Stack>
            ),
        },
        {
            id: 'apiKey',
            name: 'API Key',
            format: (value: string) => (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontFamily: 'monospace',
                            bgcolor: 'action.hover',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '11px',
                            color: 'text.secondary',
                        }}
                    >
                        {value ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}` : '—'}
                    </Typography>
                </Stack>
            ),
        },
        {
            id: 'isActive',
            name: 'Status',
            format: (value: boolean, row: WebsiteDto) => (
                <Chip
                    icon={value ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                    label={value ? 'Active' : 'Inactive'}
                    color={value ? 'success' : 'default'}
                    size="small"
                    variant={value ? 'filled' : 'outlined'}
                    onClick={canUpdate ? () => handleToggleActive(row) : undefined}
                    sx={{
                        fontWeight: 600,
                        fontSize: '11px',
                        cursor: canUpdate ? 'pointer' : 'default',
                    }}
                />
            ),
        },
        {
            id: 'createdAt',
            name: 'Created',
            format: (value: string) => (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {new Date(value).toLocaleDateString()}
                </Typography>
            ),
        },
    ];

    const actions: Action[] = [
        {
            name: 'View Details',
            icon: <Visibility sx={{ fontSize: 18 }} />,
            color: 'primary',
            onClick: (row: WebsiteDto) => navigate(`/websites/${row.id}`),
        },
        ...(canUpdate
            ? [
                  {
                      name: 'Edit Settings',
                      icon: <Edit sx={{ fontSize: 18 }} />,
                      color: '#2563eb',
                      onClick: (row: WebsiteDto) => handleOpenEdit(row),
                  },
                  {
                      name: 'Regenerate API Key',
                      icon: <Key sx={{ fontSize: 18 }} />,
                      color: '#d97706',
                      onClick: (row: WebsiteDto) => setWebsiteToRegenerateKey(row),
                  },
              ]
            : []),
        ...(canDelete
            ? [
                  {
                      name: 'Delete Website',
                      icon: <Delete sx={{ fontSize: 18 }} />,
                      color: '#ef4444',
                      onClick: (row: WebsiteDto) => setWebsiteToDelete(row),
                  },
              ]
            : []),
    ];

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            <PageHeader
                title="Websites"
                subtitle="Manage registered websites, domains, and API credentials"
                actionLabel={canCreate ? 'Register Website' : undefined}
                actionIcon={canCreate ? <Add /> : undefined}
                onAction={canCreate ? handleOpenCreate : undefined}
            />

            <GoogleSearchBar
                placeholder="Search websites by name, domain, or hosting provider..."
                value={searchInputValue}
                onChange={(val) => setSearchInputValue(val)}
                onSubmit={handleSearchSubmit}
            />

            <ListTable
                columns={columns}
                data={websites}
                actions={actions}
                pagination={{
                    total,
                    limit,
                    offset: page * limit,
                    onPageChange: (newPage: number) => setPage(newPage),
                    onRowsPerPageChange: (newLimit: number) => {
                        setLimit(newLimit);
                        setPage(0);
                    },
                }}
                emptyMessage={loading ? 'Loading websites...' : 'No websites found. Register your first website to start.'}
            />

            {/* Website Form Dialog (Create / Edit) */}
            <WebsiteFormDialog
                open={formDialogOpen}
                website={selectedWebsite}
                onClose={() => {
                    setFormDialogOpen(false);
                    setSelectedWebsite(null);
                }}
                onSuccess={() => {
                    setSnackbar({
                        open: true,
                        message: selectedWebsite
                            ? 'Website updated successfully'
                            : 'Website created successfully',
                        severity: 'success',
                    });
                    fetchWebsites();
                }}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={Boolean(websiteToDelete)}
                title="Delete Website"
                description={`Are you sure you want to delete "${websiteToDelete?.name}" (${websiteToDelete?.domain})? This action cannot be undone.`}
                confirmText="Delete Website"
                confirmColor="error"
                isLoading={isProcessing}
                onClose={() => setWebsiteToDelete(null)}
                onConfirm={handleConfirmDelete}
            />

            {/* Confirm Regenerate API Key Dialog */}
            <ConfirmDialog
                open={Boolean(websiteToRegenerateKey)}
                title="Regenerate API Key"
                description={`Are you sure you want to regenerate the API key for "${websiteToRegenerateKey?.name}"? Any external client using the current API key will immediately lose access.`}
                confirmText="Regenerate Key"
                confirmColor="warning"
                isLoading={isProcessing}
                onClose={() => setWebsiteToRegenerateKey(null)}
                onConfirm={handleConfirmRegenerateKey}
            />

            {/* Notification Toast */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default WebsitesListPage;
