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
    CircularProgress,
    Tooltip,
    Paper,
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
    ContentCopy,
    ContentPaste,
    Clear,
    Deselect,
} from '@mui/icons-material';
import { PageHeader } from '../../../../shared/components/common/PageHeader';
import { GoogleSearchBar } from '../../../../shared/components/common/GoogleSearchBar';
import ListTable, { type Column, type Action, type SelectionProps } from '../../../../shared/components/tables/ListTable';
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
    copyFolder,
} from '../../infrastructure/services/folders.service';
import {
    getAssetsPaginated,
    deleteAsset,
    copyAsset,
} from '../../infrastructure/services/assets.service';
import { getBrandById } from '../../../brands/infrastructure/services/brands.service';
import { useAuthStore } from '../../../../core/store/authStore';
import { useClipboardStore } from '../../../../core/store/clipboardStore';
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

    // Internal clipboard store
    const clipboardItems = useClipboardStore((state) => state.items);
    const copyToClipboard = useClipboardStore((state) => state.copy);
    const clearClipboard = useClipboardStore((state) => state.clear);

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
    const [isPasting, setIsPasting] = useState(false);

    // Multi-selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

    // Filter tab: 'ALL' | 'FOLDERS' | 'ASSETS'
    const [activeTab, setActiveTab] = useState<'ALL' | 'FOLDERS' | 'ASSETS'>('ALL');

    // Pagination
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(15);

    // Search query
    const [q, setQ] = useState('');
    const [searchInputValue, setSearchInputValue] = useState('');

    // Folder Dialogs & Deletion Confirmation State
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<FolderDto | null>(null);
    const [folderToDelete, setFolderToDelete] = useState<FolderDto | null>(null);
    const [deleteFolderStep, setDeleteFolderStep] = useState<1 | 2>(1);
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
            setSelectedIds([]);
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
        setSelectedIds([]);
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

    // Selection Handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(paginatedItems.map((item) => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((item) => item !== id));
        }
    };

    const selectionConfig: SelectionProps = useMemo(() => {
        const paginatedIds = paginatedItems.map((item) => item.id);
        const allSelected = paginatedIds.length > 0 && paginatedIds.every((id) => selectedIds.includes(id));
        const someSelected = paginatedIds.some((id) => selectedIds.includes(id));
        return {
            selectedIds,
            onSelectAll: handleSelectAll,
            onSelectRow: handleSelectRow,
            onSelectionChange: (ids) => setSelectedIds(ids),
            isAllSelected: allSelected,
            isIndeterminate: someSelected && !allSelected,
            enableMarqueeSelect: true,
        };
    }, [selectedIds, paginatedItems]);

    // Folder Actions
    const handleOpenCreateFolder = () => {
        setSelectedFolder(null);
        setFolderDialogOpen(true);
    };

    const handleOpenEditFolder = (folder: FolderDto) => {
        setSelectedFolder(folder);
        setFolderDialogOpen(true);
    };

    const handleDeleteFolderClick = (folder: FolderDto) => {
        setFolderToDelete(folder);
        setDeleteFolderStep(1);
    };

    const handleConfirmDeleteFolder = async () => {
        if (!folderToDelete) return;
        setIsDeletingFolder(true);
        try {
            await deleteFolder(folderToDelete.id);
            setSnackbar({
                open: true,
                message: 'Carpeta y su contenido eliminados exitosamente',
                severity: 'success',
            });
            setFolderToDelete(null);
            setDeleteFolderStep(1);
            fetchData();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Error al eliminar la carpeta',
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

    // Copy Single Item
    const handleCopyItem = (row: DirectoryItem) => {
        copyToClipboard({
            type: row.itemType,
            id: row.id,
            name: row.name,
            brandId: brandId!,
        });
        setSnackbar({
            open: true,
            message: `${row.itemType === 'FOLDER' ? 'Carpeta' : 'Archivo'} "${row.name}" copiado al portapapeles`,
            severity: 'success',
        });
    };

    // Copy Multiple Selected Items
    const handleCopySelected = () => {
        if (selectedIds.length === 0 || !brandId) return;
        const selectedItems = directoryItems.filter((item) => selectedIds.includes(item.id));
        const clipboardPayload = selectedItems.map((item) => ({
            type: item.itemType,
            id: item.id,
            name: item.name,
            brandId: brandId,
        }));

        copyToClipboard(clipboardPayload);
        setSnackbar({
            open: true,
            message: `${selectedItems.length} elemento(s) copiado(s) al portapapeles`,
            severity: 'success',
        });
        setSelectedIds([]);
    };

    // Bulk Delete Handlers
    const handleConfirmBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        setIsBulkDeleting(true);
        try {
            const selectedItems = directoryItems.filter((item) => selectedIds.includes(item.id));
            let successCount = 0;

            for (const item of selectedItems) {
                try {
                    if (item.itemType === 'FOLDER') {
                        await deleteFolder(item.id);
                    } else {
                        await deleteAsset(item.id);
                    }
                    successCount++;
                } catch (e) {
                    console.error(`Error deleting item ${item.name}:`, e);
                }
            }

            setSnackbar({
                open: true,
                message: `${successCount} elemento(s) eliminado(s) correctamente`,
                severity: 'success',
            });
            setBulkDeleteDialogOpen(false);
            setSelectedIds([]);
            fetchData();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Error durante la eliminación múltiple',
                severity: 'error',
            });
        } finally {
            setIsBulkDeleting(false);
        }
    };

    // Paste Handling (Single or Multiple Items)
    const handlePaste = async () => {
        if (clipboardItems.length === 0 || !brandId) return;
        setIsPasting(true);
        try {
            let successCount = 0;
            for (const item of clipboardItems) {
                if (item.type === 'FOLDER') {
                    await copyFolder(item.id, {
                        targetBrandId: brandId,
                        targetParentId: parentId,
                    });
                } else {
                    await copyAsset(item.id, {
                        targetBrandId: brandId,
                        targetFolderId: parentId,
                    });
                }
                successCount++;
            }

            setSnackbar({
                open: true,
                message: `${successCount} elemento(s) pegado(s) exitosamente`,
                severity: 'success',
            });
            fetchData();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Error al pegar elementos',
                severity: 'error',
            });
        } finally {
            setIsPasting(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const folderHasContent = (folder: FolderDto | null): boolean => {
        if (!folder) return false;
        const children = folder._count?.children ?? 0;
        const files = folder._count?.assets ?? folder._count?.images ?? 0;
        return children > 0 || files > 0;
    };

    const canPaste = Boolean(
        clipboardItems.length > 0 &&
        clipboardItems.some((item) => (item.type === 'FOLDER' && canCreateFolder) || (item.type === 'ASSET' && canCreateAsset))
    );

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
            name: 'Copiar',
            icon: <ContentCopy fontSize="small" />,
            visible: () => true,
            onClick: (row: DirectoryItem) => handleCopyItem(row),
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
                    handleDeleteFolderClick(row.folderData!);
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
            {/* Page Header with Responsive Compact Action Buttons */}
            <PageHeader
                title={brand ? `Directories — ${brand.name}` : 'Directories'}
                subtitle="Explore media files stored in folders."
            >
                <Stack
                    direction="row"
                    spacing={{ xs: 0.75, sm: 1.25 }}
                    sx={{
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: { xs: 0.75, sm: 1 },
                    }}
                >
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ArrowBack sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                        onClick={() => navigate('/directorios')}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: { xs: '12px', sm: '13px' },
                            px: { xs: 1, sm: 1.75 },
                            py: { xs: 0.5, sm: 0.75 },
                            color: 'text.secondary',
                            borderColor: 'divider',
                        }}
                    >
                        Return to brand
                    </Button>

                    {/* Clipboard Paste Action */}
                    {canPaste && clipboardItems.length > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <Tooltip title={`paste ${clipboardItems.length} elemet(s) copy(s)`}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    startIcon={isPasting ? <CircularProgress size={14} color="inherit" /> : <ContentPaste sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                    disabled={isPasting}
                                    onClick={handlePaste}
                                    sx={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: { xs: '12px', sm: '13px' },
                                        px: { xs: 1.25, sm: 2 },
                                        py: { xs: 0.5, sm: 0.75 },
                                        bgcolor: 'secondary.main',
                                    }}
                                >
                                    paste ({clipboardItems.length})
                                </Button>
                            </Tooltip>
                            <Tooltip title="Limpiar portapapeles">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={clearClipboard}
                                    sx={{
                                        minWidth: 32,
                                        width: 32,
                                        height: 32,
                                        p: 0,
                                        borderRadius: '8px',
                                        borderColor: 'divider',
                                        color: 'text.secondary',
                                    }}
                                >
                                    <Clear sx={{ fontSize: 16 }} />
                                </Button>
                            </Tooltip>
                        </Stack>
                    )}

                    {canCreateFolder && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Add sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                            onClick={handleOpenCreateFolder}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: { xs: '12px', sm: '13px' },
                                px: { xs: 1.25, sm: 1.75 },
                                py: { xs: 0.5, sm: 0.75 },
                            }}
                        >
                            New folder
                        </Button>
                    )}
                    {canCreateAsset && (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<CloudUpload sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                            onClick={() => setUploadDialogOpen(true)}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: { xs: '12px', sm: '13px' },
                                px: { xs: 1.25, sm: 2 },
                                py: { xs: 0.5, sm: 0.75 },
                            }}
                        >
                            Upload
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

            {/* Multi-Selection Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 1.5,
                        p: 1.5,
                        mb: 2,
                        borderRadius: '12px',
                        bgcolor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.06)',
                        border: '1px solid',
                        borderColor: 'primary.main',
                    }}
                >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Chip
                            label={`${selectedIds.length} seleccionado(s)`}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '12px' }}
                        />
                        <Typography variant="body2" sx={{ fontSize: '13px', color: 'text.secondary' }}>
                            Acciones masivas disponibles
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
                            onClick={handleCopySelected}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 500,
                                fontSize: '12px',
                            }}
                        >
                            Copiar seleccionados
                        </Button>

                        {(canDeleteFolder || canDeleteAsset) && (
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                startIcon={<Delete sx={{ fontSize: 16 }} />}
                                onClick={() => setBulkDeleteDialogOpen(true)}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '12px',
                                    boxShadow: 'none',
                                }}
                            >
                                Eliminar seleccionados
                            </Button>
                        )}

                        <Button
                            variant="text"
                            size="small"
                            startIcon={<Deselect sx={{ fontSize: 16 }} />}
                            onClick={() => setSelectedIds([])}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '12px',
                                color: 'text.secondary',
                            }}
                        >
                            Deseleccionar
                        </Button>
                    </Stack>
                </Paper>
            )}

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

            {/* Unified Explorer Table with Checkbox Multi-Selection */}
            <ListTable
                data={paginatedItems}
                columns={columns}
                actions={actions}
                selection={selectionConfig}
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

            {/* Folder Deletion: Single vs Double Confirmation */}
            {folderToDelete && !folderHasContent(folderToDelete) && (
                <ConfirmDialog
                    open={Boolean(folderToDelete)}
                    title="Delete Folder?"
                    description={
                        <span>
                            Are you sure you want to delete folder <strong>{folderToDelete.name}</strong>?
                        </span>
                    }
                    onClose={() => setFolderToDelete(null)}
                    onConfirm={handleConfirmDeleteFolder}
                    isLoading={isDeletingFolder}
                    confirmText="Delete"
                    confirmColor="error"
                />
            )}

            {folderToDelete && folderHasContent(folderToDelete) && deleteFolderStep === 1 && (
                <ConfirmDialog
                    open={Boolean(folderToDelete)}
                    title="Eliminar carpeta"
                    description={
                        <span>
                            Esta carpeta contiene contenido.
                            <br />
                            <br />
                            Si continúas, se eliminarán las carpetas y archivos que contiene.
                            <br />
                            <br />
                            ¿Deseas continuar?
                        </span>
                    }
                    onClose={() => setFolderToDelete(null)}
                    onConfirm={() => setDeleteFolderStep(2)}
                    confirmText="Continuar"
                    confirmColor="warning"
                />
            )}

            {folderToDelete && folderHasContent(folderToDelete) && deleteFolderStep === 2 && (
                <ConfirmDialog
                    open={Boolean(folderToDelete)}
                    title="⚠ Esta acción eliminará contenido"
                    description={
                        <span>
                            La carpeta contiene archivos y/o subcarpetas.
                            <br />
                            <br />
                            Al eliminarla se eliminarán permanentemente todas las imágenes y archivos que contiene, tanto del sistema como del almacenamiento.
                            <br />
                            <br />
                            Esta acción no se puede deshacer.
                            <br />
                            <br />
                            <strong>¿Está completamente seguro?</strong>
                        </span>
                    }
                    onClose={() => {
                        setFolderToDelete(null);
                        setDeleteFolderStep(1);
                    }}
                    onConfirm={handleConfirmDeleteFolder}
                    isLoading={isDeletingFolder}
                    confirmText="Eliminar definitivamente"
                    confirmColor="error"
                />
            )}

            {/* Bulk Deletion Confirmation Dialog */}
            <ConfirmDialog
                open={bulkDeleteDialogOpen}
                title="¿Eliminar elementos seleccionados?"
                description={
                    <span>
                        Está a punto de eliminar <strong>{selectedIds.length} elemento(s)</strong> seleccionados (carpetas y/o archivos).
                        <br />
                        <br />
                        Las carpetas eliminarán recursivamente todas sus subcarpetas y archivos, tanto de la base de datos como de Cloudflare R2.
                        <br />
                        <br />
                        <strong>Esta acción no se puede deshacer. ¿Desea continuar?</strong>
                    </span>
                }
                onClose={() => setBulkDeleteDialogOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                isLoading={isBulkDeleting}
                confirmText="Eliminar seleccionados"
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
