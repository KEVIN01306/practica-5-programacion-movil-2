import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
} from '@mui/material';
import { DashboardOutlined } from '@mui/icons-material';
import { PageHeader } from '../components/common/PageHeader';
import { useAuthStore } from '../../core/store/authStore';

export const DashboardPage: React.FC = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            <PageHeader
                title="Dashboard"
                subtitle="Overview and central management dashboard"
            />

            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    p: 2,
                    mt: 2,
                }}
            >
                <CardContent sx={{ py: 6, textAlign: 'center' }}>
                    <Stack spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '16px',
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <DashboardOutlined sx={{ fontSize: 36 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                Welcome to Web Admin System
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 480 }}>
                                {user ? `Logged in as ${user.firstName} ${user.lastName} (${user.email})` : 'Central system dashboard.'}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default DashboardPage;
