import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    ToggleButtonGroup,
    ToggleButton,
    Divider,
} from '@mui/material';
import {
    DesktopWindows,
    PhoneIphone,
    EmailOutlined,
} from '@mui/icons-material';

interface EmailTemplatePreviewProps {
    htmlContent: string;
    subject?: string;
    websiteName?: string;
    height?: number | string;
}

export const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({
    htmlContent,
    subject = '(No subject)',
    websiteName = 'Your Website',
    height = 500,
}) => {
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

    const handleDeviceChange = (
        _: React.MouseEvent<HTMLElement>,
        newDevice: 'desktop' | 'mobile' | null
    ) => {
        if (newDevice !== null) {
            setDevice(newDevice);
        }
    };

    // Sanitize and format for iframe srcDoc
    // We wrap raw html in default body styles if not already a full html document
    const preparedHtml = htmlContent.trim()
        ? htmlContent.includes('<html')
            ? htmlContent
            : `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 16px;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`
        : `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #94a3b8; text-align: center; padding: 40px;">
  <p>No content to preview</p>
</body>
</html>`;

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: 'background.paper',
            }}
        >
            {/* Header with mock email client bar & device switcher */}
            <Box
                sx={{
                    px: 2,
                    py: 1.25,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <EmailOutlined sx={{ color: 'text.secondary', fontSize: 18 }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: { xs: 180, sm: 300 },
                            }}
                        >
                            {subject || '(No subject)'}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}
                        >
                            From: {websiteName} &lt;noreply@example.com&gt;
                        </Typography>
                    </Box>
                </Stack>

                <ToggleButtonGroup
                    value={device}
                    exclusive
                    onChange={handleDeviceChange}
                    size="small"
                    aria-label="device preview"
                    sx={{
                        height: 28,
                        '& .MuiToggleButton-root': {
                            px: 1,
                            py: 0,
                            borderRadius: 1,
                        },
                    }}
                >
                    <ToggleButton value="desktop" aria-label="desktop preview">
                        <DesktopWindows sx={{ fontSize: 16 }} />
                    </ToggleButton>
                    <ToggleButton value="mobile" aria-label="mobile preview">
                        <PhoneIphone sx={{ fontSize: 16 }} />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Divider />

            {/* Preview Viewport Container */}
            <Box
                sx={{
                    flex: 1,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#f1f5f9'),
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    p: { xs: 1, sm: 2 },
                    overflow: 'auto',
                    minHeight: typeof height === 'number' ? height - 60 : height,
                }}
            >
                <Box
                    sx={{
                        width: device === 'mobile' ? '375px' : '100%',
                        maxWidth: device === 'mobile' ? '375px' : '680px',
                        transition: 'width 0.25s ease, max-width 0.25s ease',
                        bgcolor: '#ffffff',
                        borderRadius: device === 'mobile' ? 3 : 1.5,
                        boxShadow: 2,
                        overflow: 'hidden',
                        height: '100%',
                        minHeight: 400,
                        border: device === 'mobile' ? '8px solid #334155' : '1px solid #e2e8f0',
                    }}
                >
                    <iframe
                        title="Email Live Preview"
                        srcDoc={preparedHtml}
                        sandbox="allow-same-origin"
                        style={{
                            width: '100%',
                            height: '100%',
                            minHeight: 400,
                            border: 'none',
                            display: 'block',
                            backgroundColor: '#ffffff',
                        }}
                    />
                </Box>
            </Box>
        </Paper>
    );
};

export default EmailTemplatePreview;
