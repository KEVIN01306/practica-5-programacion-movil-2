import React, { useRef, useEffect } from 'react';
import { Box, TextField, useTheme } from '@mui/material';

interface OtpInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    disabled?: boolean;
    error?: boolean;
    autoFocus?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
    value = '',
    onChange,
    length = 6,
    disabled = false,
    error = false,
    autoFocus = true,
}) => {
    const theme = useTheme();
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    // Split value into array of length characters
    const digits = Array.from({ length }, (_, i) => value[i] || '');

    useEffect(() => {
        if (autoFocus && inputsRef.current[0]) {
            inputsRef.current[0]?.focus();
        }
    }, [autoFocus]);

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const newDigit = rawValue.replace(/\D/g, '').slice(-1); // Only take the latest digit entered

        const newDigits = [...digits];
        newDigits[index] = newDigit;
        const nextValue = newDigits.join('');
        onChange(nextValue);

        if (newDigit && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                // Focus previous input and clear it
                inputsRef.current[index - 1]?.focus();
                const newDigits = [...digits];
                newDigits[index - 1] = '';
                onChange(newDigits.join(''));
            } else {
                const newDigits = [...digits];
                newDigits[index] = '';
                onChange(newDigits.join(''));
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            e.preventDefault();
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (pastedData) {
            onChange(pastedData);
            const nextFocusIndex = Math.min(pastedData.length, length - 1);
            inputsRef.current[nextFocusIndex]?.focus();
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                gap: { xs: 1, sm: 1.5 },
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                my: 2,
            }}
        >
            {Array.from({ length }).map((_, index) => {
                const isFilled = Boolean(digits[index]);
                return (
                    <TextField
                        key={index}
                        inputRef={(el) => (inputsRef.current[index] = el)}
                        value={digits[index]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, e)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={disabled}
                        error={error}
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        slotProps={{
                            htmlInput: {
                                'aria-label': `Digit ${index + 1} of ${length}`,
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                                maxLength: 1,
                                style: {
                                    textAlign: 'center',
                                    fontSize: '1.4rem',
                                    fontWeight: 600,
                                    padding: '12px 0',
                                    fontFamily: 'monospace',
                                },
                            },
                        }}
                        sx={{
                            width: { xs: 44, sm: 52 },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff',
                                transition: 'all 0.2s ease-in-out',
                                '& fieldset': {
                                    borderColor: error
                                        ? theme.palette.error.main
                                        : isFilled
                                        ? theme.palette.primary.main
                                        : theme.palette.divider,
                                    borderWidth: isFilled || error ? '1.5px' : '1px',
                                },
                                '&:hover fieldset': {
                                    borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
                                    borderWidth: '2px',
                                    boxShadow: error
                                        ? '0 0 0 3px rgba(239, 68, 68, 0.2)'
                                        : '0 0 0 3px rgba(0, 107, 255, 0.15)',
                                },
                            },
                        }}
                    />
                );
            })}
        </Box>
    );
};

export default OtpInput;
