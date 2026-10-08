import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Button,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    Snackbar,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    ArrowBack,
    Add,
    Edit,
    Delete,
    Tag,
    Layers,
    Code,
    ShortText,
    Notes,
    Pin,
    ToggleOn,
    Event,
    DataObject,
    Link,
    CheckCircle,
    Cancel,
    CalendarToday,
    AutoAwesome,
    Close,
    Visibility,
    UploadFile,
    Download,
    Api,
} from '@mui/icons-material';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import ContentFieldFormDialog from '../components/ContentFieldFormDialog';
import ContentTypeFormDialog from '../components/ContentTypeFormDialog';
import ContentItemFormDialog from '../components/ContentItemFormDialog';
import JsonImportDialog from '../components/JsonImportDialog';
import { JsonSchemaImportDialog } from '../components/JsonSchemaImportDialog';
import HeadlessApiDocDialog from '../components/HeadlessApiDocDialog';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import { getWebsiteById } from '../../infrastructure/services/websites.service';
import {
    getContentTypeById,
    deleteContentType,
    getContentFields,
    deleteContentField,
    getContentItems,
    deleteContentItem,
    exportFieldsJson,
} from '../../infrastructure/services/content-types.service';
import type { WebsiteDto } from '../../domain/dto/websites.dto';
import type {
    ContentTypeDto,
    ContentFieldDto,
    ContentItemDto,
    FieldType,
} from '../../domain/dto/content-types.dto';

const FIELD_TYPE_CONFIG: Record<
    FieldType,
    { label: string; color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' | 'default'; icon: React.ReactNode }
> = {
    STRING: { label: 'Short Text', color: 'info', icon: <ShortText sx={{ fontSize: 16 }} /> },
    TEXT: { label: 'Long Text', color: 'secondary', icon: <Notes sx={{ fontSize: 16 }} /> },
    NUMBER: { label: 'Number', color: 'success', icon: <Pin sx={{ fontSize: 16 }} /> },
    BOOLEAN: { label: 'Boolean', color: 'warning', icon: <ToggleOn sx={{ fontSize: 16 }} /> },
    DATE: { label: 'Date', color: 'error', icon: <Event sx={{ fontSize: 16 }} /> },
    JSON: { label: 'JSON Data', color: 'default', icon: <DataObject sx={{ fontSize: 16 }} /> },
    URL: { label: 'URL / Link', color: 'primary', icon: <Link sx={{ fontSize: 16 }} /> },
};

export const ContentTypeDetailPage: React.FC = () => {
    const { websiteId, contentTypeId } = useParams<{
        websiteId: string;
        contentTypeId: string;
    }>();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const canUpdateType = hasPermission(user, 'content-types:update');
    const canDeleteType = hasPermission(user, 'content-types:delete');
    const canCreateField = hasPermission(user, 'content-fields:create');
    const canUpdateField = hasPermission(user, 'content-fields:update');
    const canDeleteField = hasPermission(user, 'content-fields:delete');
    const canCreateItem = hasPermission(user, 'content-items:create');
    const canUpdateItem = hasPermission(user, 'content-items:update');
    const canDeleteItem = hasPermission(user, 'content-items:delete');

    const [activeTab, setActiveTab] = useState<'fields' | 'items'>('fields');
    const [website, setWebsite] = useState<WebsiteDto | null>(null);
    const [contentType, setContentType] = useState<ContentTypeDto | null>(null);
    const [fields, setFields] = useState<ContentFieldDto[]>([]);
    const [items, setItems] = useState<ContentItemDto[]>([]);
    const [itemsTotal, setItemsTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingItems, setLoadingItems] = useState(false);

    // ContentType Dialog states
    const [editTypeDialogOpen, setEditTypeDialogOpen] = useState(false);
    const [deleteTypeDialogOpen, setDeleteTypeDialogOpen] = useState(false);
    const [isDeletingType, setIsDeletingType] = useState(false);

    // Field Dialog states
    const [fieldFormOpen, setFieldFormOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<ContentFieldDto | null>(null);
    const [deleteFieldDialogOpen, setDeleteFieldDialogOpen] = useState(false);
    const [fieldToDelete, setFieldToDelete] = useState<ContentFieldDto | null>(null);
    const [isDeletingField, setIsDeletingField] = useState(false);
    const [schemaImportOpen, setSchemaImportOpen] = useState(false);

    // Item Dialog states
    const [itemFormOpen, setItemFormOpen] = useState(false);
    const [jsonImportOpen, setJsonImportOpen] = useState(false);
    const [apiDocOpen, setApiDocOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ContentItemDto | null>(null);
    const [deleteItemDialogOpen, setDeleteItemDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<ContentItemDto | null>(null);
    const [isDeletingItem, setIsDeletingItem] = useState(false);
    const [jsonViewerItem, setJsonViewerItem] = useState<ContentItemDto | null>(null);

    // Toast feedback
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const loadData = useCallback(async () => {
        if (!websiteId || !contentTypeId) return;
        setLoading(true);
        try {
            const [wData, ctData, fieldsData] = await Promise.all([
                getWebsiteById(websiteId),
                getContentTypeById(contentTypeId),
                getContentFields(contentTypeId),
            ]);
            setWebsite(wData);
            setContentType(ctData);
            setFields(fieldsData);
        } catch {
            setSnackbar({
                open: true,
                message: 'Failed to load content type details',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [websiteId, contentTypeId]);

    const loadItems = useCallback(async () => {
        if (!contentTypeId) return;
        setLoadingItems(true);
        try {
            const res = await getContentItems(contentTypeId, { limit: 100 });
            setItems(res.data);
            setItemsTotal(res.total);
        } catch {
            setSnackbar({
                open: true,
                message: 'Failed to load content items',
                severity: 'error',
            });
        } finally {
            setLoadingItems(false);
        }
    }, [contentTypeId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (activeTab === 'items') {
            loadItems();
        }
    }, [activeTab, loadItems]);

    const handleBack = () => {
        if (websiteId) {
            navigate(`/websites/${websiteId}?tab=content-types`);
        } else {
            navigate('/websites');
        }
    };

    const handleConfirmDeleteType = async () => {
        if (!contentType || !websiteId) return;
        setIsDeletingType(true);
        try {
            await deleteContentType(contentType.id);
            navigate(`/websites/${websiteId}?tab=content-types`);
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete content type',
                severity: 'error',
            });
            setIsDeletingType(false);
        }
    };

    const handleOpenAddField = () => {
        setSelectedField(null);
        setFieldFormOpen(true);
    };

    const handleOpenEditField = (field: ContentFieldDto) => {
        setSelectedField(field);
        setFieldFormOpen(true);
    };

    const handleOpenDeleteField = (field: ContentFieldDto) => {
        setFieldToDelete(field);
        setDeleteFieldDialogOpen(true);
    };

    const handleConfirmDeleteField = async () => {
        if (!fieldToDelete || !contentTypeId) return;
        setIsDeletingField(true);
        try {
            await deleteContentField(fieldToDelete.id);
            setSnackbar({
                open: true,
                message: `Field "${fieldToDelete.name}" deleted successfully`,
                severity: 'success',
            });
            setDeleteFieldDialogOpen(false);
            setFieldToDelete(null);
            const updated = await getContentFields(contentTypeId);
            setFields(updated);
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete content field',
                severity: 'error',
            });
        } finally {
            setIsDeletingField(false);
        }
    };

    const handleOpenAddItem = () => {
        setSelectedItem(null);
        setItemFormOpen(true);
    };

    const handleOpenEditItem = (item: ContentItemDto) => {
        setSelectedItem(item);
        setItemFormOpen(true);
    };

    const handleOpenDeleteItem = (item: ContentItemDto) => {
        setItemToDelete(item);
        setDeleteItemDialogOpen(true);
    };

    const handleConfirmDeleteItem = async () => {
        if (!itemToDelete) return;
        setIsDeletingItem(true);
        try {
            await deleteContentItem(itemToDelete.id);
            setSnackbar({
                open: true,
                message: 'Content item deleted successfully',
                severity: 'success',
            });
            setDeleteItemDialogOpen(false);
            setItemToDelete(null);
            loadItems();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete content item',
                severity: 'error',
            });
        } finally {
            setIsDeletingItem(false);
        }
    };

    // Export all items as a JSON file and copy to clipboard
    const handleExportJson = () => {
        if (items.length === 0) {
            setSnackbar({
                open: true,
                message: 'No items available to export',
                severity: 'error',
            });
            return;
        }

        const dataOnly = items.map((item) => ({
            id: item.id,
            ...item.data,
            isPublished: item.isPublished,
            createdAt: item.createdAt,
        }));

        const jsonString = JSON.stringify(dataOnly, null, 2);

        // Copy to clipboard
        navigator.clipboard.writeText(jsonString);

        // Download file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${contentType?.slug || 'content'}-items.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setSnackbar({
            open: true,
            message: `Exported ${items.length} items to JSON and copied to clipboard`,
            severity: 'success',
        });
    };

    // Export all schema fields as a JSON file and copy to clipboard
    const handleExportSchemaJson = async () => {
        if (!contentTypeId || fields.length === 0) {
            setSnackbar({
                open: true,
                message: 'No schema fields available to export',
                severity: 'error',
            });
            return;
        }

        try {
            const schemaData = await exportFieldsJson(contentTypeId);
            const jsonString = JSON.stringify(schemaData, null, 2);

            // Copy to clipboard
            navigator.clipboard.writeText(jsonString);

            // Download file
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `schema-${contentType?.slug || 'content'}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setSnackbar({
                open: true,
                message: `Exported ${fields.length} schema fields to JSON and copied to clipboard`,
                severity: 'success',
            });
        } catch {
            setSnackbar({
                open: true,
                message: 'Failed to export schema JSON',
                severity: 'error',
            });
        }
    };

    const renderFieldValue = (val: any, field: ContentFieldDto) => {
        if (val === undefined || val === null || val === '') {
            return <Typography variant="caption" color="text.disabled">—</Typography>;
        }
        if (field.type === 'BOOLEAN') {
            return (
                <Chip
                    label={val ? 'True' : 'False'}
                    size="small"
                    color={val ? 'success' : 'default'}
                    variant={val ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.75rem', height: 22, fontWeight: 600 }}
                />
            );
        }
        if (field.type === 'URL') {
            return (
                <Typography
                    variant="body2"
                    component="a"
                    href={String(val)}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: 'primary.main', textDecoration: 'none', fontSize: '0.8125rem', '&:hover': { textDecoration: 'underline' } }}
                >
                    {String(val)}
                </Typography>
            );
        }
        if (field.type === 'DATE') {
            return (
                <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                    {new Date(val).toLocaleDateString()}
                </Typography>
            );
        }
        if (field.type === 'JSON') {
            return (
                <Chip
                    label={typeof val === 'object' ? JSON.stringify(val).slice(0, 20) + '...' : String(val).slice(0, 20)}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem', height: 22 }}
                />
            );
        }
        return (
            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                {String(val)}
            </Typography>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (!contentType) {
        return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    Content Type not found
                </Typography>
                <Button size="small" startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2, textTransform: 'none' }}>
                    Back to Content Types
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            {/* Back Button & Breadcrumbs */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button
                    size="small"
                    startIcon={<ArrowBack fontSize="small" />}
                    onClick={handleBack}
                    color="inherit"
                    sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem' }}
                >
                    Back to {website?.name || 'Website'} / Content Types
                </Button>
            </Stack>

            {/* Page Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                        {contentType.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                        {contentType.description || `Dynamic content resource for ${website?.domain || 'website'}`}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Api fontSize="small" />}
                        onClick={() => setApiDocOpen(true)}
                        sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8125rem', px: 1.5 }}
                    >
                        Headless API
                    </Button>
                    {canUpdateType && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit fontSize="small" />}
                            onClick={() => setEditTypeDialogOpen(true)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8125rem', px: 1.5 }}
                        >
                            Edit Type
                        </Button>
                    )}
                    {canDeleteType && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Delete fontSize="small" />}
                            onClick={() => setDeleteTypeDialogOpen(true)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8125rem', px: 1.5 }}
                        >
                            Delete Type
                        </Button>
                    )}
                </Stack>
            </Box>

            <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                {/* Content Type Metadata Summary Bar */}
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={3}
                        divider={<Divider orientation="vertical" flexItem />}
                        sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Tag sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Resource Slug
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main', fontSize: '0.8125rem' }}
                                >
                                    {contentType.slug}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Layers sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Fields
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                    {fields.length} {fields.length === 1 ? 'field' : 'fields'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <DataObject sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Records
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                    {itemsTotal} {itemsTotal === 1 ? 'entry' : 'entries'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <CalendarToday sx={{ color: 'text.secondary', fontSize: 18 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Created
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                                    {new Date(contentType.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>

                {/* Sub-Navigation Tabs: Schema Fields vs Content Items */}
                <Paper
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        overflow: 'hidden',
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={(_, val) => setActiveTab(val)}
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            minHeight: 42,
                            px: 2,
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                minHeight: 42,
                                py: 1,
                                fontSize: '0.8125rem',
                            },
                        }}
                    >
                        <Tab
                            value="fields"
                            label={`Schema Fields (${fields.length})`}
                            icon={<Layers sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                        />
                        <Tab
                            value="items"
                            label={`Content Items (${itemsTotal})`}
                            icon={<DataObject sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                        />
                    </Tabs>

                    <Box sx={{ p: 2.5 }}>
                        {/* TAB 1: SCHEMA FIELDS */}
                        {activeTab === 'fields' && (
                            <Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 2,
                                        gap: 1.5,
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Content Schema Fields
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Define the attributes and data types that make up this content type
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="inherit"
                                            startIcon={<Download fontSize="small" />}
                                            onClick={handleExportSchemaJson}
                                            disabled={fields.length === 0}
                                            sx={{
                                                textTransform: 'none',
                                                borderRadius: 1.5,
                                                fontWeight: 600,
                                                fontSize: '0.8125rem',
                                                px: 1.5,
                                                py: 0.5,
                                            }}
                                        >
                                            Exportar Schema
                                        </Button>

                                        {canCreateField && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<UploadFile fontSize="small" />}
                                                onClick={() => setSchemaImportOpen(true)}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: 1.5,
                                                    fontWeight: 600,
                                                    fontSize: '0.8125rem',
                                                    px: 1.5,
                                                    py: 0.5,
                                                }}
                                            >
                                                Importar Schema
                                            </Button>
                                        )}

                                        {canCreateField && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                startIcon={<Add fontSize="small" />}
                                                onClick={handleOpenAddField}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: 1.5,
                                                    fontWeight: 600,
                                                    fontSize: '0.8125rem',
                                                    px: 1.5,
                                                    py: 0.5,
                                                }}
                                            >
                                                Add Field
                                            </Button>
                                        )}
                                    </Stack>
                                </Box>

                                {/* Fields Table or Empty State */}
                                {fields.length === 0 ? (
                                    <Box
                                        sx={{
                                            py: 4,
                                            textAlign: 'center',
                                            border: '1px dashed',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            bgcolor: 'action.hover',
                                        }}
                                    >
                                        <Layers sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            No fields defined yet
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 400, mx: 'auto', mb: 2 }}>
                                            Add fields (e.g. Title, Price, Description, Images) to define the data schema.
                                        </Typography>
                                        {canCreateField && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                startIcon={<Add fontSize="small" />}
                                                onClick={handleOpenAddField}
                                                sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600, fontSize: '0.8125rem' }}
                                            >
                                                Add First Field
                                            </Button>
                                        )}
                                    </Box>
                                ) : (
                                    <TableContainer sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, py: 1.25, fontSize: '0.8125rem' }}>Field Name</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, py: 1.25, fontSize: '0.8125rem' }}>API Key</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, py: 1.25, fontSize: '0.8125rem' }}>Type</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, py: 1.25, fontSize: '0.8125rem' }}>Required</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600, py: 1.25, fontSize: '0.8125rem' }}>
                                                        Actions
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {fields.map((f) => {
                                                    const typeConfig = FIELD_TYPE_CONFIG[f.type] || {
                                                        label: f.type,
                                                        color: 'default',
                                                        icon: <Code sx={{ fontSize: 16 }} />,
                                                    };

                                                    return (
                                                        <TableRow key={f.id} hover>
                                                            <TableCell sx={{ fontWeight: 600, py: 1.25, fontSize: '0.8125rem' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                                                                        {typeConfig.icon}
                                                                    </Box>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                                                        {f.name}
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>

                                                            <TableCell sx={{ py: 1.25 }}>
                                                                <Chip
                                                                    label={f.key}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        fontFamily: 'monospace',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.75rem',
                                                                        height: 22,
                                                                        bgcolor: 'action.hover',
                                                                    }}
                                                                />
                                                            </TableCell>

                                                            <TableCell sx={{ py: 1.25 }}>
                                                                <Chip
                                                                    label={typeConfig.label}
                                                                    size="small"
                                                                    color={typeConfig.color}
                                                                    sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22 }}
                                                                />
                                                            </TableCell>

                                                            <TableCell sx={{ py: 1.25 }}>
                                                                <Chip
                                                                    label={f.isRequired ? 'Required' : 'Optional'}
                                                                    size="small"
                                                                    variant={f.isRequired ? 'filled' : 'outlined'}
                                                                    color={f.isRequired ? 'primary' : 'default'}
                                                                    sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22 }}
                                                                />
                                                            </TableCell>

                                                            <TableCell align="right" sx={{ py: 1.25 }}>
                                                                <Stack direction="row" spacing={0.25} sx={{ justifyContent: 'flex-end' }}>
                                                                    {canUpdateField && (
                                                                        <Tooltip title="Edit Field">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleOpenEditField(f)}
                                                                                color="primary"
                                                                            >
                                                                                <Edit sx={{ fontSize: 16 }} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                    {canDeleteField && (
                                                                        <Tooltip title="Delete Field">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleOpenDeleteField(f)}
                                                                                color="error"
                                                                            >
                                                                                <Delete sx={{ fontSize: 16 }} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                </Stack>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>
                        )}

                        {/* TAB 2: CONTENT ITEMS */}
                        {activeTab === 'items' && (
                            <Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 2,
                                        gap: 1.5,
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Content Items & Records
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Entries and records saved for this {contentType.name} schema
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                                        {/* Export JSON button */}
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<Download fontSize="small" />}
                                            onClick={handleExportJson}
                                            disabled={items.length === 0}
                                            sx={{
                                                textTransform: 'none',
                                                borderRadius: 1.5,
                                                fontSize: '0.8125rem',
                                                px: 1.5,
                                            }}
                                        >
                                            Export JSON
                                        </Button>

                                        {/* Import JSON button */}
                                        {canCreateItem && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<UploadFile fontSize="small" />}
                                                onClick={() => setJsonImportOpen(true)}
                                                disabled={fields.length === 0}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: 1.5,
                                                    fontSize: '0.8125rem',
                                                    px: 1.5,
                                                }}
                                            >
                                                Import JSON
                                            </Button>
                                        )}

                                        {/* Add Item button */}
                                        {canCreateItem && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                startIcon={<Add fontSize="small" />}
                                                onClick={handleOpenAddItem}
                                                disabled={fields.length === 0}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: 1.5,
                                                    fontWeight: 600,
                                                    fontSize: '0.8125rem',
                                                    px: 1.5,
                                                    py: 0.5,
                                                }}
                                            >
                                                Add Item
                                            </Button>
                                        )}
                                    </Stack>
                                </Box>

                                {fields.length === 0 ? (
                                    <Alert severity="warning" sx={{ borderRadius: 1.5, fontSize: '0.8125rem' }}>
                                        Before creating content items, configure at least one field in the "Schema Fields" tab.
                                    </Alert>
                                ) : loadingItems ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress size={32} />
                                    </Box>
                                ) : items.length === 0 ? (
                                    <Box
                                        sx={{
                                            py: 4,
                                            textAlign: 'center',
                                            border: '1px dashed',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            bgcolor: 'action.hover',
                                        }}
                                    >
                                        <DataObject sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            No items created yet
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 400, mx: 'auto', mb: 2 }}>
                                            Start adding records using the dynamic form or import multiple items directly from JSON.
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                            {canCreateItem && (
                                                <>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        startIcon={<Add fontSize="small" />}
                                                        onClick={handleOpenAddItem}
                                                        sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600, fontSize: '0.8125rem' }}
                                                    >
                                                        Add First Item
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<UploadFile fontSize="small" />}
                                                        onClick={() => setJsonImportOpen(true)}
                                                        sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8125rem' }}
                                                    >
                                                        Import from JSON
                                                    </Button>
                                                </>
                                            )}
                                        </Stack>
                                    </Box>
                                ) : (
                                    <TableContainer sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                                <TableRow>
                                                    {/* Render up to 4 schema field column headers */}
                                                    {fields.slice(0, 4).map((f) => (
                                                        <TableCell key={f.id} sx={{ fontWeight: 600, py: 1.25, fontSize: '0.8125rem' }}>
                                                            {f.name}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell sx={{ fontWeight: 600, py: 1.25, fontSize: '0.8125rem' }}>Status</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, py: 1.25, fontSize: '0.8125rem' }}>Created</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600, py: 1.25, fontSize: '0.8125rem' }}>
                                                        Actions
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {items.map((item) => (
                                                    <TableRow key={item.id} hover>
                                                        {/* Render up to 4 dynamic field values */}
                                                        {fields.slice(0, 4).map((f) => (
                                                            <TableCell key={f.id} sx={{ py: 1.25 }}>
                                                                {renderFieldValue(item.data?.[f.key], f)}
                                                            </TableCell>
                                                        ))}

                                                        <TableCell sx={{ py: 1.25 }}>
                                                            <Chip
                                                                icon={item.isPublished ? <CheckCircle sx={{ fontSize: '13px !important' }} /> : <Cancel sx={{ fontSize: '13px !important' }} />}
                                                                label={item.isPublished ? 'Published' : 'Draft'}
                                                                size="small"
                                                                color={item.isPublished ? 'success' : 'default'}
                                                                sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22 }}
                                                            />
                                                        </TableCell>

                                                        <TableCell sx={{ py: 1.25 }}>
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                                {new Date(item.createdAt).toLocaleDateString()}
                                                            </Typography>
                                                        </TableCell>

                                                        <TableCell align="right" sx={{ py: 1.25 }}>
                                                            <Stack direction="row" spacing={0.25} sx={{ justifyContent: 'flex-end' }}>
                                                                <Tooltip title="View JSON">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => setJsonViewerItem(item)}
                                                                        color="info"
                                                                    >
                                                                        <Visibility sx={{ fontSize: 16 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                {canUpdateItem && (
                                                                    <Tooltip title="Edit Item">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleOpenEditItem(item)}
                                                                            color="primary"
                                                                        >
                                                                            <Edit sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {canDeleteItem && (
                                                                    <Tooltip title="Delete Item">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleOpenDeleteItem(item)}
                                                                            color="error"
                                                                        >
                                                                            <Delete sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>
                        )}
                    </Box>
                </Paper>

                {/* Architecture Preview Box */}
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <AutoAwesome sx={{ color: 'text.secondary', fontSize: 20, mt: 0.25 }} />
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.25 }}>
                                    Headless Content Delivery Endpoint
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8125rem' }}>
                                    Access this resource dynamically via <code>/api/v1/content/{contentType.slug}</code> using header <code>x-api-key: {website?.apiKey ? `${website.apiKey.slice(0, 10)}...` : 'key'}</code>.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        size="small"
                                        icon={<CheckCircle sx={{ fontSize: '13px !important' }} />}
                                        label="JSON Bulk Importer"
                                        color="success"
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem', height: 22 }}
                                    />
                                    <Chip
                                        size="small"
                                        icon={<CheckCircle sx={{ fontSize: '13px !important' }} />}
                                        label="1-Click JSON Export"
                                        color="success"
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem', height: 22 }}
                                    />
                                    <Chip
                                        size="small"
                                        icon={<CheckCircle sx={{ fontSize: '13px !important' }} />}
                                        label="Headless REST API"
                                        color="success"
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem', height: 22 }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Api fontSize="small" />}
                            onClick={() => setApiDocOpen(true)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem' }}
                        >
                            View API Documentation
                        </Button>
                    </Box>
                </Paper>
            </Stack>

            {/* ContentType Edit Dialog */}
            {websiteId && (
                <ContentTypeFormDialog
                    open={editTypeDialogOpen}
                    websiteId={websiteId}
                    contentType={contentType}
                    onClose={() => setEditTypeDialogOpen(false)}
                    onSuccess={() => {
                        setSnackbar({
                            open: true,
                            message: 'Content type updated successfully',
                            severity: 'success',
                        });
                        loadData();
                    }}
                />
            )}

            {/* ContentType Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteTypeDialogOpen}
                title="Delete Content Type"
                description={`Are you sure you want to delete "${contentType.name}" (${contentType.slug})? All associated fields and content items will be permanently removed.`}
                confirmText="Delete"
                confirmColor="error"
                isLoading={isDeletingType}
                onClose={() => setDeleteTypeDialogOpen(false)}
                onConfirm={handleConfirmDeleteType}
            />

            {/* Field Form Dialog */}
            <ContentFieldFormDialog
                open={fieldFormOpen}
                contentTypeId={contentType.id}
                field={selectedField}
                onClose={() => setFieldFormOpen(false)}
                onSuccess={async () => {
                    setSnackbar({
                        open: true,
                        message: selectedField
                            ? 'Field updated successfully'
                            : 'Field added successfully',
                        severity: 'success',
                    });
                    const updated = await getContentFields(contentType.id);
                    setFields(updated);
                }}
            />

            {/* Field Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteFieldDialogOpen}
                title="Delete Schema Field"
                description={`Are you sure you want to delete the field "${fieldToDelete?.name}" (${fieldToDelete?.key})? Note: Historical items will retain raw JSON data, but this field will no longer be part of the active schema.`}
                confirmText="Delete"
                confirmColor="error"
                isLoading={isDeletingField}
                onClose={() => setDeleteFieldDialogOpen(false)}
                onConfirm={handleConfirmDeleteField}
            />

            {/* ContentItem Form Dialog */}
            <ContentItemFormDialog
                open={itemFormOpen}
                contentTypeId={contentType.id}
                contentTypeName={contentType.name}
                fields={fields}
                item={selectedItem}
                onClose={() => setItemFormOpen(false)}
                onSuccess={() => {
                    setSnackbar({
                        open: true,
                        message: selectedItem
                            ? 'Item updated successfully'
                            : 'Item created successfully',
                        severity: 'success',
                    });
                    loadItems();
                }}
            />

            {/* JSON Bulk Import Dialog for Items */}
            <JsonImportDialog
                open={jsonImportOpen}
                contentTypeId={contentType.id}
                contentTypeName={contentType.name}
                fields={fields}
                onClose={() => setJsonImportOpen(false)}
                onSuccess={(count) => {
                    setSnackbar({
                        open: true,
                        message: `Successfully imported ${count} items from JSON`,
                        severity: 'success',
                    });
                    loadItems();
                }}
            />

            {/* JSON Schema Bulk Import Dialog for Fields */}
            <JsonSchemaImportDialog
                open={schemaImportOpen}
                contentTypeId={contentType.id}
                contentTypeName={contentType.name}
                onClose={() => setSchemaImportOpen(false)}
                onSuccess={async (importedCount, skippedCount) => {
                    setSnackbar({
                        open: true,
                        message: `Successfully imported ${importedCount} schema fields${skippedCount > 0 ? ` (${skippedCount} already existed)` : ''
                            }`,
                        severity: 'success',
                    });
                    const updated = await getContentFields(contentType.id);
                    setFields(updated);
                }}
            />

            {/* Headless API Documentation Dialog */}
            {website && (
                <HeadlessApiDocDialog
                    open={apiDocOpen}
                    websiteName={website.name}
                    websiteDomain={website.domain}
                    apiKey={website.apiKey}
                    contentTypeSlug={contentType.slug}
                    onClose={() => setApiDocOpen(false)}
                />
            )}

            {/* ContentItem Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteItemDialogOpen}
                title="Delete Content Item"
                description="Are you sure you want to delete this content item? This action cannot be undone."
                confirmText="Delete"
                confirmColor="error"
                isLoading={isDeletingItem}
                onClose={() => setDeleteItemDialogOpen(false)}
                onConfirm={handleConfirmDeleteItem}
            />

            {/* JSON Data Viewer Dialog */}
            <Dialog
                open={Boolean(jsonViewerItem)}
                onClose={() => setJsonViewerItem(null)}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 2, p: 0.5 } } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DataObject sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Raw Item JSON Data
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setJsonViewerItem(null)}>
                        <Close fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ borderColor: 'divider', p: 2 }}>
                    <Box
                        component="pre"
                        sx={{
                            p: 2,
                            borderRadius: 1.5,
                            bgcolor: 'action.hover',
                            fontFamily: 'monospace',
                            fontSize: '0.8125rem',
                            overflowX: 'auto',
                            m: 0,
                        }}
                    >
                        {JSON.stringify(jsonViewerItem?.data ?? {}, null, 2)}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 2, py: 1 }}>
                    <Button size="small" onClick={() => setJsonViewerItem(null)} sx={{ textTransform: 'none', fontSize: '0.8125rem' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toast Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
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

export default ContentTypeDetailPage;
