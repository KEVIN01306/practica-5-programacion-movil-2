import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
    Snackbar,
    Divider,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
} from '@mui/material';
import {
    ArrowBack,
    Storage,
    Notes,
    Key,
    ContentCopy,
    Edit,
    Delete,
    OpenInNew,
    CheckCircle,
    Refresh,
    Person,
    CalendarToday,
    ViewStream,
    Settings,
    Api,
    Email,
    DynamicForm,
} from '@mui/icons-material';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import WebsiteFormDialog from '../components/WebsiteFormDialog';
import ContentTypesTab from '../components/ContentTypesTab';
import EmailTemplatesTab from '../components/EmailTemplatesTab';
import FormsTab from '../components/FormsTab';
import WebsiteFavicon from '../../../../shared/components/common/WebsiteFavicon';
import HeadlessApiDocDialog from '../components/HeadlessApiDocDialog';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import {
    getWebsiteById,
    deleteWebsite,
    regenerateWebsiteApiKey,
    updateWebsite,
} from '../../infrastructure/services/websites.service';
import type { WebsiteDto } from '../../domain/dto/websites.dto';

export const WebsiteDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const canUpdate = hasPermission(user, 'websites:update');
    const canDelete = hasPermission(user, 'websites:delete');

    // Tab handling
    const getInitialTab = () => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'forms') return 3;
        if (tabParam === 'email-templates') return 2;
        if (tabParam === 'content-types') return 1;
        return 0;
    };
    const [activeTab, setActiveTab] = useState(getInitialTab());

    const [website, setWebsite] = useState<WebsiteDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
    const [apiDocOpen, setApiDocOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Toast feedback
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const fetchWebsite = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await getWebsiteById(id);
            setWebsite(data);
        } catch {
            setSnackbar({
                open: true,
                message: 'Failed to load website details',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchWebsite();
    }, [fetchWebsite]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        if (newValue === 1) {
            setSearchParams({ tab: 'content-types' });
        } else if (newValue === 2) {
            setSearchParams({ tab: 'email-templates' });
        } else if (newValue === 3) {
            setSearchParams({ tab: 'forms' });
        } else {
            setSearchParams({});
        }
    };

    const handleCopyApiKey = () => {
        if (!website?.apiKey) return;
        navigator.clipboard.writeText(website.apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setSnackbar({
            open: true,
            message: 'API Key copied to clipboard',
            severity: 'success',
        });
    };

    const handleConfirmDelete = async () => {
        if (!website) return;
        setIsProcessing(true);
        try {
            await deleteWebsite(website.id);
            navigate('/websites');
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete website',
                severity: 'error',
            });
            setIsProcessing(false);
        }
    };

    const handleConfirmRegenerateKey = async () => {
        if (!website) return;
        setIsProcessing(true);
        try {
            const updated = await regenerateWebsiteApiKey(website.id);
            setWebsite(updated);
            setSnackbar({
                open: true,
                message: 'API Key successfully regenerated',
                severity: 'success',
            });
            setRegenerateDialogOpen(false);
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

    const handleToggleActive = async () => {
        if (!website || !canUpdate) return;
        try {
            const updated = await updateWebsite(website.id, { isActive: !website.isActive });
            setWebsite(updated);
            setSnackbar({
                open: true,
                message: `Website "${website.name}" is now ${!website.isActive ? 'Active' : 'Inactive'}`,
                severity: 'success',
            });
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to update website status',
                severity: 'error',
            });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (!website) {
        return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    Website not found
                </Typography>
                <Button size="small" startIcon={<ArrowBack />} onClick={() => navigate('/websites')} sx={{ mt: 2, textTransform: 'none' }}>
                    Back to Websites
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            {/* Back Button & Header */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button
                    size="small"
                    startIcon={<ArrowBack fontSize="small" />}
                    onClick={() => navigate('/websites')}
                    color="inherit"
                    sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem' }}
                >
                    Back to Websites
                </Button>
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <WebsiteFavicon domain={website.domain} name={website.name} size={40} iconSize={22} />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                            {website.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                            {website.domain}
                        </Typography>
                    </Box>
                </Box>
                <Stack direction="row" spacing={1}>
                    {canUpdate && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit fontSize="small" />}
                            onClick={() => setEditDialogOpen(true)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8125rem', px: 1.75 }}
                        >
                            Edit Website
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Delete fontSize="small" />}
                            onClick={() => setDeleteDialogOpen(true)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8125rem', px: 1.75 }}
                        >
                            Delete Website
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* Context Navigation Tabs */}
            <Paper
                variant="outlined"
                sx={{
                    mt: 2.5,
                    borderRadius: 2,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="standard"
                    sx={{
                        px: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        minHeight: 42,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 42,
                            py: 1,
                            fontSize: '0.8125rem',
                        },
                    }}
                >
                    <Tab icon={<Settings sx={{ fontSize: 18 }} />} iconPosition="start" label="Overview & Configuration" />
                    <Tab icon={<ViewStream sx={{ fontSize: 18 }} />} iconPosition="start" label="Content Types" />
                    <Tab icon={<Email sx={{ fontSize: 18 }} />} iconPosition="start" label="Email Templates" />
                    <Tab icon={<DynamicForm sx={{ fontSize: 18 }} />} iconPosition="start" label="Forms" />
                </Tabs>
            </Paper>

            {/* Tab Panel 0: Overview */}
            {activeTab === 0 && (
                <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                    {/* 1. API Credentials & Access Section */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderRadius: 2,
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Key sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        API Key & Client Integration
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Use in headers (`x-api-key`) to query headless content
                                    </Typography>
                                </Box>
                            </Box>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Api fontSize="small" />}
                                    onClick={() => setApiDocOpen(true)}
                                    sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem', py: 0.25, px: 1.25 }}
                                >
                                    API Documentation
                                </Button>
                                {canUpdate && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="warning"
                                        startIcon={<Refresh fontSize="small" />}
                                        onClick={() => setRegenerateDialogOpen(true)}
                                        sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem', py: 0.25, px: 1.25 }}
                                    >
                                        Regenerate Key
                                    </Button>
                                )}
                            </Stack>
                        </Box>

                        <TextField
                            value={website.apiKey}
                            size="small"
                            fullWidth
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    sx: { fontFamily: 'monospace', fontSize: '0.8125rem', bgcolor: 'action.hover' },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip title={copied ? 'Copied!' : 'Copy API Key'}>
                                                <IconButton onClick={handleCopyApiKey} edge="end" size="small" color="primary">
                                                    <ContentCopy sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Paper>

                    {/* 2. Technical & Domain Details */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderRadius: 2,
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                            Website Information
                        </Typography>

                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                    <WebsiteFavicon domain={website.domain} name={website.name} size={28} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Target Domain
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {website.domain}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button
                                    size="small"
                                    endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                                    component="a"
                                    href={`https://${website.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                >
                                    Visit Website
                                </Button>
                            </Box>

                            <Divider />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                    <Storage sx={{ color: 'text.secondary', fontSize: 20 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Hosting Provider
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {website.hostingProvider || 'Not specified'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                    <CheckCircle sx={{ color: website.isActive ? 'success.main' : 'text.disabled', fontSize: 20 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Status
                                        </Typography>
                                        <Box sx={{ mt: 0.25 }}>
                                            <Chip
                                                label={website.isActive ? 'Active' : 'Inactive'}
                                                color={website.isActive ? 'success' : 'default'}
                                                size="small"
                                                sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22 }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                {canUpdate && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={handleToggleActive}
                                        sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem', py: 0.25 }}
                                    >
                                        {website.isActive ? 'Deactivate Website' : 'Activate Website'}
                                    </Button>
                                )}
                            </Box>

                            {website.hostingNotes && (
                                <>
                                    <Divider />
                                    <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                                        <Notes sx={{ color: 'text.secondary', fontSize: 20, mt: 0.25 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Infrastructure & Deployment Notes
                                            </Typography>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 0.5, fontSize: '0.8125rem' }}>
                                                {website.hostingNotes}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </Stack>
                    </Paper>

                    {/* 3. Metadata & Audit Overview */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderRadius: 2,
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                            Metadata & Ownership
                        </Typography>

                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                                <Person sx={{ color: 'text.secondary', fontSize: 18 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Assigned Owner
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                                        {website.owner
                                            ? `${website.owner.firstName} ${website.owner.lastName} (${website.owner.email})`
                                            : 'Platform Administrator / Shared'}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                                <CalendarToday sx={{ color: 'text.secondary', fontSize: 18 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Registration Date
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                                        {new Date(website.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </Paper>
                </Stack>
            )}

            {/* Tab Panel 1: Content Types */}
            {activeTab === 1 && (
                <Box sx={{ mt: 2.5 }}>
                    <ContentTypesTab websiteId={website.id} websiteName={website.name} />
                </Box>
            )}

            {/* Tab Panel 2: Email Templates */}
            {activeTab === 2 && (
                <Box sx={{ mt: 2.5 }}>
                    <EmailTemplatesTab websiteId={website.id} websiteName={website.name} />
                </Box>
            )}

            {/* Tab Panel 3: Forms */}
            {activeTab === 3 && (
                <Box sx={{ mt: 2.5 }}>
                    <FormsTab
                        websiteId={website.id}
                        websiteName={website.name}
                        websiteDomain={website.domain}
                    />
                </Box>
            )}

            {/* Edit Dialog */}
            <WebsiteFormDialog
                open={editDialogOpen}
                website={website}
                onClose={() => setEditDialogOpen(false)}
                onSuccess={() => {
                    setSnackbar({
                        open: true,
                        message: 'Website updated successfully',
                        severity: 'success',
                    });
                    fetchWebsite();
                }}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Website"
                description={`Are you sure you want to delete "${website.name}" (${website.domain})? This action cannot be undone.`}
                confirmText="Delete"
                confirmColor="error"
                isLoading={isProcessing}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
            />

            {/* Regenerate API Key Confirmation Dialog */}
            <ConfirmDialog
                open={regenerateDialogOpen}
                title="Regenerate API Key"
                description={`Are you sure you want to regenerate the API key for "${website.name}"? Existing integrations using the previous key will immediately stop working.`}
                confirmText="Regenerate Key"
                confirmColor="warning"
                isLoading={isProcessing}
                onClose={() => setRegenerateDialogOpen(false)}
                onConfirm={handleConfirmRegenerateKey}
            />

            {/* Headless API Documentation Dialog */}
            <HeadlessApiDocDialog
                open={apiDocOpen}
                websiteName={website.name}
                websiteDomain={website.domain}
                apiKey={website.apiKey}
                onClose={() => setApiDocOpen(false)}
            />

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

export default WebsiteDetailPage;
