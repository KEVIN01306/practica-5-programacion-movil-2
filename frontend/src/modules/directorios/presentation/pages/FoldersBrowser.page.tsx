import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Chip,
    Typography,
    Snackbar,
    Alert,
    Stack,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Add,
    CloudUpload,
    Folder,
    FolderOpen,
    Edit,
    Delete,
    ArrowBack,
    PictureAsPdf,
    Description,
    VideoFile,
    AudioFile,
    InsertDriveFile,
    Visibility,
    SwapHoriz,
} from '@mui/icons-material';
import { PageHeader } from '../../../../shared/components/common/PageHeader';
import { GoogleSearchBar } from '../../../../shared/components/common/GoogleSearchBar';
import ListTable, { type Column, type Action } from '../../../../shared/components/tables/ListTable';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import FolderBreadcrumb from '../components/FolderBreadcrumb';
import FolderFormDialog from '../components/FolderFormDialog';
import AssetUploadDialog from '../components/AssetUploadDialog';
import AssetDetailDialog from '../components/AssetDetailDialog';
import AssetReplaceDialog from '../components/AssetReplaceDialog';
import AssetEditDialog from '../components/AssetEditDialog';
import {
    getFoldersPaginated,
    getFolderById,
    deleteFolder,
} from '../../infrastructure/services/folders.service';
import {
    getAssetsPaginated,
    deleteAsset,
} from '../../infrastructure/services/assets.service';
import { getBrandById } from '../../../brands/infrastructure/services/brands.service';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import type { FolderDto, FolderBreadcrumbItem } from '../../domain/dto/folders.dto';
import type { BrandDto } from '../../../brands/domain/dto/brands.dto';
import type { AssetDto } from '../../domain/dto/assets.dto';

export interface DirectoryItem {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    itemType: 'FOLDER' | 'ASSET';
    folderData?: FolderDto;
    assetData?: AssetDto;
}

export const FoldersBrowserPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const canCreateFolder = hasPermission(user, 'folders:create');
    const canUpdateFolder = hasPermission(user, 'folders:update');
    const canDeleteFolder = hasPermission(user, 'folders:delete');
    const canCreateAsset = hasPermission(user, 'assets:create');
    const canUpdateAsset = hasPermission(user, 'assets:update');
    const canDeleteAsset = hasPermission(user, 'assets:delete');

    const brandId = searchParams.get('brandId');
    const parentId = searchParams.get('parentId') || null;

    const [brand, setBrand] = useState<BrandDto | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<FolderBreadcrumbItem[]>([]);

    // Data state
    const [folders, setFolders] = useState<FolderDto[]>([]);
    const [assets, setAssets] = useState<AssetDto[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter tab: 'ALL' | 'FOLDERS' | 'ASSETS'
    const [activeTab, setActiveTab] = useState<'ALL' | 'FOLDERS' | 'ASSETS'>('ALL');

    // Pagination
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(15);

    // Search query
    const [q, setQ] = useState('');
    const [searchInputValue, setSearchInputValue] = useState('');

    // Folder Dialogs
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<FolderDto | null>(null);
    const [folderToDelete, setFolderToDelete] = useState<FolderDto | null>(null);
    const [isDeletingFolder, setIsDeletingFolder] = useState(false);

    // Asset Dialogs
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [detailAsset, setDetailAsset] = useState<AssetDto | null>(null);
    const [replaceAsset, setReplaceAsset] = useState<AssetDto | null>(null);
    const [editAsset, setEditAsset] = useState<AssetDto | null>(null);
    const [assetToDelete, setAssetToDelete] = useState<AssetDto | null>(null);
    const [isDeletingAsset, setIsDeletingAsset] = useState(false);

    // Toast
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    // 1. Fetch Brand info
    useEffect(() => {
        if (!brandId) return;
        getBrandById(brandId)
            .then(setBrand)
            .catch(() => {
                setSnackbar({
                    open: true,
                    message: 'Failed to load brand details',
                    severity: 'error',
                });
            });
    }, [brandId]);

    // 2. Fetch breadcrumbs if inside a parent folder
    useEffect(() => {
        if (!parentId) {
            setBreadcrumbs([]);
            return;
        }

        getFolderById(parentId)
            .then((folder) => {
                setBreadcrumbs(folder.breadcrumbs || []);
            })
            .catch(() => {
                setBreadcrumbs([]);
            });
    }, [parentId]);

    // 3. Fetch folders & assets together for current level
    const fetchData = useCallback(async () => {
        if (!brandId) return;
        setLoading(true);
        try {
            const [foldersRes, assetsRes] = await Promise.all([
                getFoldersPaginated(brandId, parentId, 1, 100, q || undefined),
                getAssetsPaginated({
                    brandId,
                    folderId: parentId,
                    page: 1,
                    limit: 100,
                    q: q || undefined,
                }),
            ]);
            setFolders(foldersRes.data);
            setAssets(assetsRes.data);
        } catch {
            setSnackbar({
                open: true,
                message: 'Failed to load directory items',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [brandId, parentId, q]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setQ(searchInputValue);
    };

    const handleNavigate = (targetParentId: string | null) => {
        const nextParams = new URLSearchParams(searchParams);
        if (targetParentId) {
            nextParams.set('parentId', targetParentId);
        } else {
            nextParams.delete('parentId');
        }
        setSearchParams(nextParams);
        setPage(0);
        setQ('');
        setSearchInputValue('');
    };

    // Unified Directory Items
    const directoryItems = useMemo<DirectoryItem[]>(() => {
        const folderItems: DirectoryItem[] = folders.map((f) => ({
            id: f.id,
            name: f.name,
            description: f.description,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
            itemType: 'FOLDER',
            folderData: f,
        }));

        const assetItems: DirectoryItem[] = assets.map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
            itemType: 'ASSET',
            assetData: a,
        }));

        if (activeTab === 'FOLDERS') return folderItems;
        if (activeTab === 'ASSETS') return assetItems;
        return [...folderItems, ...assetItems];
    }, [folders, assets, activeTab]);

    const paginatedItems = useMemo(() => {
        const start = page * limit;
        return directoryItems.slice(start, start + limit);
    }, [directoryItems, page, limit]);

    // Folder Actions
    const handleOpenCreateFolder = () => {
        setSelectedFolder(null);
        setFolderDialogOpen(true);
    };

    const handleOpenEditFolder = (folder: FolderDto) => {
        setSelectedFolder(folder);
        setFolderDialogOpen(true);
    };

    const handleConfirmDeleteFolder = async () => {
        if (!folderToDelete) return;
        setIsDeletingFolder(true);
        try {
            await deleteFolder(folderToDelete.id);
            setSnackbar({
                open: true,
                message: 'Directory deleted successfully',
                severity: 'success',
            });
            setFolderToDelete(null);
            fetchData();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete directory',
                severity: 'error',
            });
        } finally {
            setIsDeletingFolder(false);
        }
    };

    // Asset Actions
    const handleConfirmDeleteAsset = async () => {
        if (!assetToDelete) return;
        setIsDeletingAsset(true);
        try {
            await deleteAsset(assetToDelete.id);
            setSnackbar({
                open: true,
                message: 'Asset deleted successfully from R2 and database',
                severity: 'success',
            });
            setAssetToDelete(null);
            if (detailAsset?.id === assetToDelete.id) {
                setDetailAsset(null);
            }
            fetchData();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete asset',
                severity: 'error',
            });
        } finally {
            setIsDeletingAsset(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const columns: Column[] = [
        {
            id: 'name',
            name: 'Name',
            format: (value: string, row: DirectoryItem) => {
                if (row.itemType === 'FOLDER') {
                    return (
                        <Box
                            onClick={() => handleNavigate(row.id)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                cursor: 'pointer',
                                '&:hover .folder-title': { textDecoration: 'underline', color: 'primary.main' },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '8px',
                                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Folder sx={{ fontSize: 22 }} />
                            </Box>
                            <Typography
                                className="folder-title"
                                sx={{ fontWeight: 600, fontSize: '13px', color: 'text.primary', transition: 'color 0.15s' }}
                            >
                                {value}
                            </Typography>
                        </Box>
                    );
                }

                const asset = row.assetData!;
                const cacheBustedUrl = `${asset.url}?v=${new Date(asset.updatedAt).getTime()}`;

                return (
                    <Box
                        onClick={() => setDetailAsset(asset)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                            '&:hover .asset-title': { color: 'primary.main' },
                        }}
                    >
                        {/* Thumbnail if image, or specific icon if pdf/doc/etc */}
                        {asset.type === 'IMAGE' ? (
                            <Box
                                component="img"
                                src={cacheBustedUrl}
                                alt={asset.name}
                                loading="lazy"
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'action.hover',
                                    flexShrink: 0,
                                }}
                            />
                        ) : asset.extension === 'pdf' ? (
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '8px',
                                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <PictureAsPdf sx={{ fontSize: 22 }} />
                            </Box>
                        ) : asset.type === 'VIDEO' ? (
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '8px',
                                    bgcolor: 'rgba(168, 85, 247, 0.1)',
                                    color: '#a855f7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <VideoFile sx={{ fontSize: 22 }} />
                            </Box>
                        ) : asset.type === 'AUDIO' ? (
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '8px',
                                    bgcolor: 'rgba(234, 179, 8, 0.1)',
                                    color: '#eab308',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <AudioFile sx={{ fontSize: 22 }} />
                            </Box>
                        ) : asset.type === 'DOCUMENT' ? (
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '8px',
                                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                                    color: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Description sx={{ fontSize: 22 }} />
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '8px',
                                    bgcolor: 'action.hover',
                                    color: 'text.secondary',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <InsertDriveFile sx={{ fontSize: 22 }} />
                            </Box>
                        )}

                        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                            <Typography
                                className="asset-title"
                                noWrap
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    color: 'text.primary',
                                    transition: 'color 0.15s',
                                }}
                            >
                                {value}
                            </Typography>
                            {asset.sku && (
                                <Chip
                                    size="small"
                                    label={`SKU: ${asset.sku}`}
                                    sx={{
                                        height: 18,
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        bgcolor: 'rgba(59, 130, 246, 0.08)',
                                        color: 'primary.main',
                                        width: 'fit-content',
                                    }}
                                />
                            )}
                        </Stack>
                    </Box>
                );
            },
        },
        {
            id: 'type',
            name: 'Type',
            format: (_: any, row: DirectoryItem) => {
                if (row.itemType === 'FOLDER') {
                    return (
                        <Chip
                            size="small"
                            label="Folder"
                            variant="outlined"
                            sx={{ fontSize: '11px', fontWeight: 500, borderColor: 'divider' }}
                        />
                    );
                }
                const asset = row.assetData!;
                return (
                    <Chip
                        size="small"
                        label={asset.extension ? `.${asset.extension.toUpperCase()}` : asset.type}
                        sx={{
                            fontSize: '11px',
                            fontWeight: 600,
                            bgcolor: asset.type === 'IMAGE' ? 'rgba(59, 130, 246, 0.1)' : 'action.hover',
                            color: asset.type === 'IMAGE' ? 'primary.main' : 'text.secondary',
                        }}
                    />
                );
            },
        },
        {
            id: 'description',
            name: 'Description',
            format: (value: string | null) => (
                <Typography noWrap sx={{ fontSize: '13px', color: 'text.secondary', maxWidth: 260 }}>
                    {value || '—'}
                </Typography>
            ),
        },
        {
            id: 'sizeOrContent',
            name: 'Size / Contents',
            format: (_: any, row: DirectoryItem) => {
                if (row.itemType === 'FOLDER') {
                    const children = row.folderData?._count?.children ?? 0;
                    const files = row.folderData?._count?.assets ?? row.folderData?._count?.images ?? 0;
                    return (
                        <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                            {children} {children === 1 ? 'folder' : 'folders'} • {files} {files === 1 ? 'file' : 'files'}
                        </Typography>
                    );
                }
                return (
                    <Typography sx={{ fontSize: '12px', color: 'text.secondary', fontWeight: 500 }}>
                        {formatBytes(row.assetData?.sizeBytes || 0)}
                    </Typography>
                );
            },
        },
        {
            id: 'createdAt',
            name: 'Created Date',
            format: (value: string) => (
                <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                    {new Date(value).toLocaleDateString()}
                </Typography>
            ),
        },
    ];

    const actions: Action[] = [
        {
            name: 'Open Folder',
            icon: <FolderOpen fontSize="small" />,
            visible: (row: DirectoryItem) => row.itemType === 'FOLDER',
            onClick: (row: DirectoryItem) => handleNavigate(row.id),
        },
        {
            name: 'View Details',
            icon: <Visibility fontSize="small" />,
            visible: (row: DirectoryItem) => row.itemType === 'ASSET',
            onClick: (row: DirectoryItem) => setDetailAsset(row.assetData!),
        },
        {
            name: 'Replace File',
            icon: <SwapHoriz fontSize="small" />,
            visible: (row: DirectoryItem) => row.itemType === 'ASSET' && canUpdateAsset,
            onClick: (row: DirectoryItem) => setReplaceAsset(row.assetData!),
        },
        {
            name: 'Edit',
            icon: <Edit fontSize="small" />,
            visible: (row: DirectoryItem) => (row.itemType === 'FOLDER' ? canUpdateFolder : canUpdateAsset),
            onClick: (row: DirectoryItem) => {
                if (row.itemType === 'FOLDER') {
                    handleOpenEditFolder(row.folderData!);
                } else {
                    setEditAsset(row.assetData!);
                }
            },
        },
        {
            name: 'Delete',
            icon: <Delete fontSize="small" />,
            color: '#ef4444',
            visible: (row: DirectoryItem) => (row.itemType === 'FOLDER' ? canDeleteFolder : canDeleteAsset),
            onClick: (row: DirectoryItem) => {
                if (row.itemType === 'FOLDER') {
                    setFolderToDelete(row.folderData!);
                } else {
                    setAssetToDelete(row.assetData!);
                }
            },
        },
    ];

    if (!brandId) {
        return null;
    }

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            {/* Page Header */}
            <PageHeader
                title={brand ? `Directories — ${brand.name}` : 'Directories'}
                subtitle="Explore folders and media files stored in Cloudflare R2"
            >
                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/directorios')}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            color: 'text.secondary',
                            borderColor: 'divider',
                        }}
                    >
                        Switch Brand
                    </Button>
                    {canCreateFolder && (
                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={handleOpenCreateFolder}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            New Folder
                        </Button>
                    )}
                    {canCreateAsset && (
                        <Button
                            variant="contained"
                            startIcon={<CloudUpload />}
                            onClick={() => setUploadDialogOpen(true)}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Upload Asset
                        </Button>
                    )}
                </Stack>
            </PageHeader>

            {/* Breadcrumb Navigation */}
            <FolderBreadcrumb
                brandName={brand ? brand.name : 'Brand'}
                breadcrumbs={breadcrumbs}
                onNavigate={handleNavigate}
            />

            {/* Search Bar & View Filters */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <Box sx={{ width: { xs: '100%', md: 450 } }}>
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
                        placeholder="Search folders and assets..."
                        loading={loading}
                    />
                </Box>

                <Tabs
                    value={activeTab}
                    onChange={(_, val) => {
                        setActiveTab(val);
                        setPage(0);
                    }}
                    sx={{
                        minHeight: 38,
                        '& .MuiTab-root': {
                            minHeight: 38,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '13px',
                            px: 2,
                        },
                    }}
                >
                    <Tab label={`All (${folders.length + assets.length})`} value="ALL" />
                    <Tab label={`Folders (${folders.length})`} value="FOLDERS" />
                    <Tab label={`Files & Media (${assets.length})`} value="ASSETS" />
                </Tabs>
            </Box>

            {/* Unified Explorer Table */}
            <ListTable
                data={paginatedItems}
                columns={columns}
                actions={actions}
                emptyMessage="No folders or assets found in this directory"
                pagination={{
                    total: directoryItems.length,
                    limit,
                    offset: page * limit,
                    onPageChange: (newPage) => setPage(newPage),
                    onRowsPerPageChange: (newLimit) => {
                        setLimit(newLimit);
                        setPage(0);
                    },
                }}
            />

            {/* Folder Dialogs */}
            <FolderFormDialog
                open={folderDialogOpen}
                onClose={() => setFolderDialogOpen(false)}
                onSuccess={() => {
                    setSnackbar({
                        open: true,
                        message: selectedFolder ? 'Directory updated successfully' : 'Directory created successfully',
                        severity: 'success',
                    });
                    fetchData();
                }}
                brandId={brandId}
                parentId={parentId}
                initialData={selectedFolder}
            />

            <ConfirmDialog
                open={Boolean(folderToDelete)}
                title="Delete Folder?"
                description={
                    <span>
                        Are you sure you want to delete folder <strong>{folderToDelete?.name}</strong>? All its subfolders will also be deleted.
                    </span>
                }
                onClose={() => setFolderToDelete(null)}
                onConfirm={handleConfirmDeleteFolder}
                isLoading={isDeletingFolder}
                confirmText="Delete"
                confirmColor="error"
            />

            {/* Asset Dialogs */}
            <AssetUploadDialog
                open={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
                onSuccess={() => {
                    setSnackbar({
                        open: true,
                        message: 'Asset uploaded to R2 successfully!',
                        severity: 'success',
                    });
                    fetchData();
                }}
                brandId={brandId}
                folderId={parentId}
            />

            <AssetDetailDialog
                asset={detailAsset}
                open={Boolean(detailAsset)}
                onClose={() => setDetailAsset(null)}
                onEdit={(a) => {
                    setDetailAsset(null);
                    setEditAsset(a);
                }}
                onReplace={(a) => {
                    setDetailAsset(null);
                    setReplaceAsset(a);
                }}
                onDelete={(a) => {
                    setAssetToDelete(a);
                }}
            />

            <AssetReplaceDialog
                asset={replaceAsset}
                open={Boolean(replaceAsset)}
                onClose={() => setReplaceAsset(null)}
                onSuccess={(updated) => {
                    setSnackbar({
                        open: true,
                        message: 'File replaced in R2 successfully while keeping stable URL!',
                        severity: 'success',
                    });
                    setReplaceAsset(null);
                    fetchData();
                    if (detailAsset?.id === updated.id) {
                        setDetailAsset(updated);
                    }
                }}
            />

            <AssetEditDialog
                asset={editAsset}
                open={Boolean(editAsset)}
                onClose={() => setEditAsset(null)}
                onSuccess={(updated) => {
                    setSnackbar({
                        open: true,
                        message: 'Asset information updated successfully',
                        severity: 'success',
                    });
                    setEditAsset(null);
                    fetchData();
                    if (detailAsset?.id === updated.id) {
                        setDetailAsset(updated);
                    }
                }}
            />

            <ConfirmDialog
                open={Boolean(assetToDelete)}
                title="Delete Asset?"
                description={
                    <span>
                        Are you sure you want to permanently delete asset <strong>{assetToDelete?.name}</strong>? It will be removed from Cloudflare R2 and the database.
                    </span>
                }
                onClose={() => setAssetToDelete(null)}
                onConfirm={handleConfirmDeleteAsset}
                isLoading={isDeletingAsset}
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

export default FoldersBrowserPage;
