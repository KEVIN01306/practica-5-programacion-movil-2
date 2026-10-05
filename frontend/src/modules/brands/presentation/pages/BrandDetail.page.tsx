import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Divider,
    CircularProgress,
    Alert,
} from '@mui/material';
import { ArrowBack, Folder, Edit, Category } from '@mui/icons-material';
import { PageHeader } from '../../../../shared/components/common/PageHeader';
import BrandFormDialog from '../components/BrandFormDialog';
import { useAuthStore } from '../../../../core/store/authStore';
import { hasPermission } from '../../../../core/utils/permissions';
import { getBrandById } from '../../infrastructure/services/brands.service';
import type { BrandDto } from '../../domain/dto/brands.dto';

export const BrandDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const canUpdate = hasPermission(user, 'brands:update');

    const [brand, setBrand] = useState<BrandDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const fetchBrand = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getBrandById(id);
            setBrand(data);
        } catch {
            setError('Failed to load brand details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrand();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !brand) {
        return (
            <Box sx={{ py: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || 'Brand not found'}
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/brands')}>
                    Back to Brands
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            <PageHeader
                title={brand.name}
                subtitle="Overview and detailed configuration of the brand"
            >
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/brands')}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        color: 'text.secondary',
                        borderColor: 'divider',
                    }}
                >
                    Back
                </Button>
                {canUpdate && (
                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => setEditDialogOpen(true)}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                        }}
                    >
                        Edit Brand
                    </Button>
                )}
            </PageHeader>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
                {/* Main Information */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: '16px',
                        border: '0.5px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        p: 1,
                    }}
                >
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px', mb: 2 }}>
                            General Information
                        </Typography>
                        <Divider sx={{ mb: 2.5 }} />

                        <Stack spacing={2.5}>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                    Brand Name
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {brand.name}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                    Description
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                                    {brand.description || 'No description recorded'}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                    Brand ID (UUID)
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                    {brand.id}
                                </Typography>
                            </Box>

                            <Divider />

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                        Created At
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {new Date(brand.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                        Last Updated
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {new Date(brand.updatedAt).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Sidebar Stats & Direct Action */}
                <Stack spacing={2}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: '16px',
                            border: '0.5px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            p: 1,
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '15px', mb: 2 }}>
                                Associated Resources
                            </Typography>

                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: 'action.hover', borderRadius: '12px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Folder sx={{ color: 'primary.main', fontSize: 24 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Directories
                                    </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {brand._count?.folders ?? 0}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: 'action.hover', borderRadius: '12px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Category sx={{ color: '#10b981', fontSize: 24 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Images
                                    </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {brand._count?.images ?? 0}
                                </Typography>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<Folder />}
                                onClick={() => navigate(`/directorios?brandId=${brand.id}`)}
                                sx={{
                                    mt: 1,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                }}
                            >
                                Explore Directories
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Box>

        {/* Edit Dialog */}
        <BrandFormDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSuccess={() => fetchBrand()}
            initialData={brand}
        />
    </Box>
    );
};

export default BrandDetailPage;
