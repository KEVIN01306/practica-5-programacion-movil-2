import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Chip,
    Typography,
    Snackbar,
    Alert,
    Stack,
    Avatar,
    MenuItem,
    TextField,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Visibility,
    Language,
    CheckCircle,
    Schedule,
    Block,
    Archive,
} from '@mui/icons-material';
import { PageHeader } from '../../../../shared/components/common/PageHeader';
import { GoogleSearchBar } from '../../../../shared/components/common/GoogleSearchBar';
import ListTable, { type Column, type Action } from '../../../../shared/components/tables/ListTable';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import ContactFormDialog from '../components/ContactFormDialog';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import { getContacts, deleteContact } from '../../infrastructure/services/contacts.service';
import { getWebsitesPaginated } from '../../../websites/infrastructure/services/websites.service';
import type { ContactDto, ContactStatusDto } from '../../domain/dto/contacts.dto';
import type { WebsiteDto } from '../../../websites/domain/dto/websites.dto';

const STATUS_ICONS: Record<ContactStatusDto, React.ReactElement> = {
    LEAD: <Schedule sx={{ fontSize: 13 }} />,
    ACTIVE: <CheckCircle sx={{ fontSize: 13 }} />,
    UNSUBSCRIBED: <Block sx={{ fontSize: 13 }} />,
    ARCHIVED: <Archive sx={{ fontSize: 13 }} />,
};

const STATUS_COLORS: Record<ContactStatusDto, 'info' | 'success' | 'warning' | 'default'> = {
    LEAD: 'info',
    ACTIVE: 'success',
    UNSUBSCRIBED: 'warning',
    ARCHIVED: 'default',
};

export const ContactsListPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const canCreate = hasPermission(user, 'contacts:create');
    const canUpdate = hasPermission(user, 'contacts:update');
    const canDelete = hasPermission(user, 'contacts:delete');

    const [contacts, setContacts] = useState<ContactDto[]>([]);
    const [websites, setWebsites] = useState<WebsiteDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0); // ListTable uses 0-based page for offset
    const [limit, setLimit] = useState(15);

    // Filters
    const [searchInputValue, setSearchInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWebsite, setSelectedWebsite] = useState<string>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

    // Dialogs
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<ContactDto | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<ContactDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Snackbar
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getContacts({
                page: page + 1, // backend is 1-indexed
                limit,
                search: searchQuery.trim() || undefined,
                websiteId: selectedWebsite !== 'ALL' ? selectedWebsite : undefined,
                status: selectedStatus !== 'ALL' ? (selectedStatus as ContactStatusDto) : undefined,
            });
            setContacts(res.data);
            setTotal(res.total);
        } catch {
            setSnackbar({
                open: true,
                message: 'Failed to load contacts directory',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [page, limit, searchQuery, selectedWebsite, selectedStatus]);

    useEffect(() => {
        getWebsitesPaginated(1, 100)
            .then((res) => setWebsites(res.data))
            .catch(() => setWebsites([]));
    }, []);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setSearchQuery(searchInputValue);
    };

    const handleOpenCreate = () => {
        setSelectedContact(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (contact: ContactDto) => {
        setSelectedContact(contact);
        setFormDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!contactToDelete) return;
        setIsDeleting(true);
        try {
            await deleteContact(contactToDelete.id);
            setSnackbar({
                open: true,
                message: `Contact "${contactToDelete.email}" deleted successfully`,
                severity: 'success',
            });
            setDeleteDialogOpen(false);
            setContactToDelete(null);
            fetchContacts();
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Failed to delete contact',
                severity: 'error',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: Column[] = useMemo(
        () => [
            {
                id: 'contact',
                name: 'Contact',
                format: (_val: unknown, row: ContactDto) => {
                    const name = `${row.firstName || ''} ${row.lastName || ''}`.trim();
                    const initial = (row.firstName?.[0] || row.email[0] || 'C').toUpperCase();
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 200 }}>
                            <Avatar
                                sx={{
                                    width: 34,
                                    height: 34,
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                }}
                            >
                                {initial}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.8125rem',
                                        color: 'primary.main',
                                        lineHeight: 1.2,
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' },
                                    }}
                                    noWrap
                                    onClick={() => navigate(`/contacts/${row.id}`)}
                                >
                                    {name || 'Unnamed Contact'}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                                    noWrap
                                >
                                    {row.email}
                                </Typography>
                            </Box>
                        </Box>
                    );
                },
            },
            {
                id: 'website',
                name: 'Origin Website',
                format: (_val: unknown, row: ContactDto) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Language sx={{ fontSize: 15, color: 'text.secondary' }} />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                variant="body2"
                                sx={{ fontSize: '0.8125rem', color: 'text.primary', fontWeight: 500 }}
                                noWrap
                            >
                                {row.website?.name || '—'}
                            </Typography>
                            {row.website?.domain && (
                                <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}
                                    noWrap
                                >
                                    {row.website.domain}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                ),
            },
            {
                id: 'phone',
                name: 'Phone / Company',
                format: (_val: unknown, row: ContactDto) => (
                    <Box>
                        <Typography
                            variant="body2"
                            sx={{ fontSize: '0.8125rem', color: row.phone ? 'text.primary' : 'text.disabled' }}
                            noWrap
                        >
                            {row.phone || 'No phone'}
                        </Typography>
                        {row.company && (
                            <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                                noWrap
                            >
                                {row.company}
                            </Typography>
                        )}
                    </Box>
                ),
            },
            {
                id: 'submissions',
                name: 'Inquiries',
                format: (_val: unknown, row: ContactDto) => (
                    <Chip
                        label={`${row.submissionsCount ?? row.submissions?.length ?? 0} sent`}
                        size="small"
                        variant="outlined"
                        sx={{
                            fontSize: '0.6875rem',
                            height: 22,
                            borderColor: 'divider',
                            bgcolor: 'action.hover',
                        }}
                    />
                ),
            },
            {
                id: 'status',
                name: 'Status',
                format: (value: ContactStatusDto) => (
                    <Chip
                        icon={STATUS_ICONS[value] || undefined}
                        label={value}
                        color={STATUS_COLORS[value] || 'default'}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            height: 22,
                        }}
                    />
                ),
            },
            {
                id: 'createdAt',
                name: 'Added',
                format: (value: string) => (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        {value ? new Date(value).toLocaleDateString() : '—'}
                    </Typography>
                ),
            },
        ],
        []
    );

    const actions: Action[] = useMemo(
        () => [
            {
                name: 'View Details',
                icon: <Visibility sx={{ fontSize: 16 }} />,
                color: 'primary',
                onClick: (row: ContactDto) => navigate(`/contacts/${row.id}`),
            },
            ...(canUpdate
                ? [
                      {
                          name: 'Edit Contact',
                          icon: <Edit sx={{ fontSize: 16 }} />,
                          color: '#2563eb',
                          onClick: (row: ContactDto) => handleOpenEdit(row),
                      },
                  ]
                : []),
            ...(canDelete
                ? [
                      {
                          name: 'Delete Contact',
                          icon: <Delete sx={{ fontSize: 16 }} />,
                          color: '#ef4444',
                          onClick: (row: ContactDto) => {
                              setContactToDelete(row);
                              setDeleteDialogOpen(true);
                          },
                      },
                  ]
                : []),
        ],
        [canUpdate, canDelete, navigate]
    );

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            {/* Header with Title and Action Button */}
            <PageHeader
                title="Contacts"
                subtitle="Centralized directory of leads, prospects, and form submissions across websites"
                actionLabel={canCreate ? 'Add Contact' : undefined}
                actionIcon={canCreate ? <Add sx={{ fontSize: 18 }} /> : undefined}
                onAction={canCreate ? handleOpenCreate : undefined}
            />

            {/* Filters bar */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 1.5,
                    mb: 2,
                    alignItems: { xs: 'stretch', md: 'center' },
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <GoogleSearchBar
                        placeholder="Search contacts by name, email, company, or phone..."
                        value={searchInputValue}
                        onChange={(val) => setSearchInputValue(val)}
                        onSubmit={handleSearchSubmit}
                    />
                </Box>

                <Stack direction="row" spacing={1.5} sx={{ minWidth: { xs: '100%', md: 360 } }}>
                    <TextField
                        select
                        size="small"
                        fullWidth
                        value={selectedWebsite}
                        onChange={(e) => {
                            setSelectedWebsite(e.target.value);
                            setPage(0);
                        }}
                        label="Website"
                        slotProps={{
                            input: {
                                sx: { fontSize: '0.8125rem', height: 40 },
                            },
                        }}
                    >
                        <MenuItem value="ALL">All Websites</MenuItem>
                        {websites.map((w) => (
                            <MenuItem key={w.id} value={w.id}>
                                {w.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        size="small"
                        fullWidth
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setPage(0);
                        }}
                        label="Status"
                        slotProps={{
                            input: {
                                sx: { fontSize: '0.8125rem', height: 40 },
                            },
                        }}
                    >
                        <MenuItem value="ALL">All Statuses</MenuItem>
                        <MenuItem value="LEAD">Lead</MenuItem>
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="UNSUBSCRIBED">Unsubscribed</MenuItem>
                        <MenuItem value="ARCHIVED">Archived</MenuItem>
                    </TextField>
                </Stack>
            </Box>

            {/* ListTable Component */}
            <ListTable
                columns={columns}
                data={contacts}
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
                emptyMessage={
                    loading
                        ? 'Loading contacts...'
                        : 'No contacts found. Incoming submissions from forms will automatically register here.'
                }
            />

            {/* Contact Form Dialog */}
            <ContactFormDialog
                open={formDialogOpen}
                contact={selectedContact}
                onClose={() => {
                    setFormDialogOpen(false);
                    setSelectedContact(null);
                }}
                onSuccess={() => {
                    setSnackbar({
                        open: true,
                        message: selectedContact
                            ? 'Contact updated successfully'
                            : 'Contact created successfully',
                        severity: 'success',
                    });
                    fetchContacts();
                }}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Contact"
                description={`Are you sure you want to delete contact "${contactToDelete?.email}"? This record will be permanently removed.`}
                confirmText="Delete Contact"
                confirmColor="error"
                isLoading={isDeleting}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setContactToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
            />

            {/* Snackbar */}
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
                    sx={{ width: '100%', fontSize: '0.8125rem' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ContactsListPage;
