import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, Typography, Snackbar, Alert } from '@mui/material';
import { Add, Edit, Delete, Folder, Visibility } from '@mui/icons-material';
import { PageHeader } from '../../../../shared/components/common/PageHeader';
import { GoogleSearchBar } from '../../../../shared/components/common/GoogleSearchBar';
import ListTable, { type Column, type Action } from '../../../../shared/components/tables/ListTable';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import BrandFormDialog from '../components/BrandFormDialog';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission, hasSomePermission } from '../../../../core/utils/permissions';
import { getBrandsPaginated, deleteBrand } from '../../infrastructure/services/brands.service';
import type { BrandDto } from '../../domain/dto/brands.dto';

export const BrandsListPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const canCreate = hasPermission(user, 'brands:create');
    const canUpdate = hasPermission(user, 'brands:update');
    const canDelete = hasPermission(user, 'brands:delete');
    const canExplore = hasSomePermission(user, ['folders:read', 'assets:read', 'brands:read']);
    const canViewDetails = hasSomePermission(user, ['brands:read', 'assets:read', 'folders:read']);

    // Data state
    const [brands, setBrands] = useState<BrandDto[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [q, setQ] = useState('');
    const [searchInputValue, setSearchInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    // Dialogs state
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<BrandDto | null>(null);
    const [brandToDelete, setBrandToDelete] = useState<BrandDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toast notification
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const fetchBrands = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getBrandsPaginated(page + 1, limit, q || undefined);
            setBrands(res.data);
            setTotal(res.total);
        } catch {
            setSnackbar({
                open: true,
                message: 'Failed to load brands',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [page, limit, q]);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setQ(searchInputValue);
    };

    const handleOpenCreate = () => {
        setSelectedBrand(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (brand: BrandDto) => {
        setSelectedBrand(brand);
        setFormDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!brandToDelete) return;
        setIsDeleting(true);
        try {
            await deleteBrand(brandToDelete.id);
            setSnackbar({
                open: true,
                message: 'Brand deleted successfully',
                severity: 'success',
            });
            setBrandToDelete(null);
            fetchBrands();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete brand',
                severity: 'error',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: Column[] = [
        {
            id: 'name',
            name: 'Brand Name',
            format: (value: string) => (
                <Typography sx={{ fontWeight: 600, fontSize: '13px', color: 'text.primary' }}>
                    {value}
                </Typography>
            ),
        },
        {
            id: 'description',
            name: 'Description',
            format: (value: string | null) => (
                <Typography noWrap sx={{ fontSize: '13px', color: 'text.secondary', maxWidth: 300 }}>
                    {value || '—'}
                </Typography>
            ),
        },
        {
            id: 'foldersCount',
            name: 'Directories',
            format: (_: any, row: BrandDto) => (
                <Chip
                    size="small"
                    label={`${row._count?.folders ?? 0} folders`}
                    sx={{ fontSize: '11px', fontWeight: 500, bgcolor: 'action.hover' }}
                />
            ),
        },
        {
            id: 'imagesCount',
            name: 'Images',
            format: (_: any, row: BrandDto) => (
                <Chip
                    size="small"
                    label={`${row._count?.images ?? 0} assets`}
                    sx={{ fontSize: '11px', fontWeight: 500, bgcolor: 'action.hover' }}
                />
            ),
        },
        {
            id: 'createdAt',
            name: 'Created At',
            format: (value: string) => (
                <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                    {new Date(value).toLocaleDateString()}
                </Typography>
            ),
        },
    ];

    const actions: Action[] = [
        {
            name: 'Explore Directories',
            icon: <Folder fontSize="small" />,
            visible: () => canExplore,
            onClick: (row: BrandDto) => navigate(`/directorios?brandId=${row.id}`),
        },
        {
            name: 'View Details',
            icon: <Visibility fontSize="small" />,
            visible: () => canViewDetails,
            onClick: (row: BrandDto) => navigate(`/brands/${row.id}`),
        },
        {
            name: 'Edit',
            icon: <Edit fontSize="small" />,
            visible: () => canUpdate,
            onClick: (row: BrandDto) => handleOpenEdit(row),
        },
        {
            name: 'Delete',
            icon: <Delete fontSize="small" />,
            color: '#ef4444',
            visible: () => canDelete,
            onClick: (row: BrandDto) => setBrandToDelete(row),
        },
    ];

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            <PageHeader
                title="Brands"
                subtitle="Manage and organize your global brand assets and digital catalogs"
                actionLabel={canCreate ? "New Brand" : undefined}
                actionIcon={canCreate ? <Add /> : undefined}
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
                placeholder="Search brands by name or description..."
                loading={loading}
            />

            <ListTable
                data={brands}
                columns={columns}
                actions={actions}
                emptyMessage="No brands registered yet"
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

            {/* Create / Edit Dialog */}
            <BrandFormDialog
                open={formDialogOpen}
                onClose={() => setFormDialogOpen(false)}
                onSuccess={() => {
                    setSnackbar({
                        open: true,
                        message: selectedBrand ? 'Brand updated successfully' : 'Brand created successfully',
                        severity: 'success',
                    });
                    fetchBrands();
                }}
                initialData={selectedBrand}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={Boolean(brandToDelete)}
                title="Delete Brand?"
                description={
                    <span>
                        Are you sure you want to delete brand <strong>{brandToDelete?.name}</strong>? All associated directories and subfolders will also be removed.
                    </span>
                }
                onClose={() => setBrandToDelete(null)}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
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

export default BrandsListPage;
