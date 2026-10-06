import React from 'react';
import { Box, Typography, LinearProgress, Stack } from '@mui/material';
import { Check, Close } from '@mui/icons-material';

interface PasswordStrengthMeterProps {
    password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
    if (!password) return null;

    const hasLength = password.length >= 8;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    const score = [hasLength, hasLetters, hasNumbers, hasSpecial].filter(Boolean).length;

    let strengthLabel = 'Weak';
    let strengthColor: 'error' | 'warning' | 'success' = 'error';
    let progressValue = 25;

    if (score === 4) {
        strengthLabel = 'Strong';
        strengthColor = 'success';
        progressValue = 100;
    } else if (score >= 2 && hasLength) {
        strengthLabel = 'Medium';
        strengthColor = 'warning';
        progressValue = 66;
    } else {
        strengthLabel = 'Weak';
        strengthColor = 'error';
        progressValue = 33;
    }

    return (
        <Box sx={{ mt: 1, mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                    Password Strength:
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 600,
                        fontSize: '11px',
                        color:
                            strengthColor === 'success'
                                ? 'success.main'
                                : strengthColor === 'warning'
                                ? 'warning.main'
                                : 'error.main',
                    }}
                >
                    {strengthLabel}
                </Typography>
            </Box>

            <LinearProgress
                variant="determinate"
                value={progressValue}
                color={strengthColor}
                sx={{
                    height: 5,
                    borderRadius: 3,
                    bgcolor: 'action.hover',
                    mb: 1.5,
                }}
            />

            <Stack spacing={0.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {hasLength ? (
                        <Check sx={{ fontSize: 13, color: 'success.main' }} />
                    ) : (
                        <Close sx={{ fontSize: 13, color: 'text.disabled' }} />
                    )}
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '11px',
                            color: hasLength ? 'text.primary' : 'text.secondary',
                        }}
                    >
                        At least 8 characters
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {hasNumbers && hasLetters ? (
                        <Check sx={{ fontSize: 13, color: 'success.main' }} />
                    ) : (
                        <Close sx={{ fontSize: 13, color: 'text.disabled' }} />
                    )}
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '11px',
                            color: hasNumbers && hasLetters ? 'text.primary' : 'text.secondary',
                        }}
                    >
                        Letters and numbers
                    </Typography>
                </Box>
            </Stack>
        </Box>
    );
};

export default PasswordStrengthMeter;
