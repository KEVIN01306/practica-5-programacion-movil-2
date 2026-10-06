import { useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
    Stack,
    Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { loginSchema, type LoginFormValues } from '../../domain/schemas/auth.schemas';
import { loginUser } from '../../infrastructure/services/auth.service';
import { useAuthStore } from '../../../../core/store/authStore';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const { setAuth } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
        setServerError(null);
        try {
            const response = await loginUser(values);
            setAuth(response.accessToken, response.user);
            if (response.user.isVerify === false) {
                navigate('/auth/verify-account', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch {
            setServerError('Invalid email or password. Please try again.');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fb',    // Cloud canvas
                p: 2,
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 440 }}>

                {/* Brand header */}
                <Stack sx={{ alignItems: 'center', mb: 4, gap: 1 }}>
                    {/* Logo mark — Signal Blue square */}
                    <Box
                        component="img"
                        src={"/logo.png"}
                        alt={"Logo"}
                        sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '10px',
                            mb: 0.5,
                        }}
                    />
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: '1.75rem',   // 28px subheading size
                            fontWeight: 700,
                            color: '#0b3558',
                            textAlign: 'center',
                        }}
                    >
                        Welcome back
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ color: '#476788', textAlign: 'center' }}
                    >
                        Sign in to your account to continue
                    </Typography>
                </Stack>

                {/* Card — Product card style: 16px radius, white, blue-tinted shadow */}
                <Card
                    sx={{
                        borderRadius: '16px',
                        border: '1px solid #d4e0ed',
                        boxShadow: 'rgba(71,103,136,0.04) 0px 4px 5px 0px, rgba(71,103,136,0.03) 0px 8px 15px 0px, rgba(71,103,136,0.08) 0px 30px 50px 0px',
                        backgroundColor: '#ffffff',
                    }}
                >
                    <CardContent sx={{ p: { xs: 3, sm: 4 } }}>

                        {/* Server error */}
                        {serverError && (
                            <Alert
                                severity="error"
                                sx={{ mb: 3, borderRadius: 2 }}
                                onClose={() => setServerError(null)}
                            >
                                {serverError}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <Stack sx={{ gap: 2.5 }}>
                                {/* Email */}
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            id="login-email"
                                            label="Email address"
                                            type="email"
                                            autoComplete="email"
                                            autoFocus
                                            fullWidth
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                        />
                                    )}
                                />

                                {/* Password */}
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            id="login-password"
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            fullWidth
                                            error={!!errors.password}
                                            helperText={errors.password?.message}
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                id="toggle-password-visibility"
                                                                aria-label="Toggle password visibility"
                                                                onClick={() => setShowPassword((v) => !v)}
                                                                edge="end"
                                                                size="small"
                                                                sx={{ color: '#a6bbd1' }}
                                                            >
                                                                {showPassword
                                                                    ? <VisibilityOff fontSize="small" />
                                                                    : <Visibility fontSize="small" />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    )}
                                />

                                {/* Forgot password link */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => navigate('/auth/change-password')}
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '12.5px',
                                            fontWeight: 500,
                                            color: '#006bff',
                                            p: 0,
                                            minWidth: 'auto',
                                            '&:hover': {
                                                bgcolor: 'transparent',
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        Forgot password?
                                    </Button>
                                </Box>

                                {/* Submit — Primary Signal Blue CTA */}
                                <Button
                                    id="login-submit"
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={isSubmitting}
                                    sx={{ mt: 0.5 }}
                                >
                                    {isSubmitting ? (
                                        <CircularProgress size={20} thickness={3} sx={{ color: '#ffffff' }} />
                                    ) : (
                                        'Sign in'
                                    )}
                                </Button>
                            </Stack>
                        </form>

                        {/* Divider with "or" */}
                        <Box sx={{ my: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Divider sx={{ flex: 1 }} />
                            <Typography variant="caption" sx={{ color: '#a6bbd1' }}>
                                or
                            </Typography>
                            <Divider sx={{ flex: 1 }} />
                        </Box>

                        {/* Footnote */}
                        <Typography
                            variant="caption"
                            sx={{ display: 'block', textAlign: 'center', color: '#476788' }}
                        >
                            Contact your administrator if you need access.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default LoginPage;
