import React, { useState } from 'react';
import { Box, Avatar } from '@mui/material';
import { Language } from '@mui/icons-material';

interface WebsiteFaviconProps {
    domain?: string | null;
    name?: string;
    size?: number;
    iconSize?: number;
}

export const WebsiteFavicon: React.FC<WebsiteFaviconProps> = ({
    domain,
    name = '',
    size = 32,
    iconSize = 18,
}) => {
    const [hasError, setHasError] = useState(false);

    const cleanDomain = domain ? domain.replace(/^https?:\/\//, '').split('/')[0].trim() : '';

    if (!cleanDomain || hasError) {
        return (
            <Avatar
                variant="rounded"
                sx={{
                    width: size,
                    height: size,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    fontWeight: 700,
                    fontSize: Math.max(11, Math.round(size * 0.4)),
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {name ? name.charAt(0).toUpperCase() : <Language sx={{ fontSize: iconSize }} />}
            </Avatar>
        );
    }

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanDomain)}&sz=64`;

    return (
        <Box
            sx={{
                width: size,
                height: size,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                p: 0.5,
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
        >
            <Box
                component="img"
                src={faviconUrl}
                alt={name || cleanDomain}
                onError={() => setHasError(true)}
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                }}
            />
        </Box>
    );
};

export default WebsiteFavicon;
