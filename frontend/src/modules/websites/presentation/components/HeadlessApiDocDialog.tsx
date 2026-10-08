import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Box,
    Typography,
    IconButton,
    Tabs,
    Tab,
    Chip,
    Tooltip,
} from '@mui/material';
import {
    Close,
    ContentCopy,
    Check,
    Api,
} from '@mui/icons-material';

interface HeadlessApiDocDialogProps {
    open: boolean;
    websiteName: string;
    websiteDomain: string;
    apiKey: string;
    contentTypeSlug?: string;
    onClose: () => void;
}

export const HeadlessApiDocDialog: React.FC<HeadlessApiDocDialogProps> = ({
    open,
    websiteName,
    websiteDomain,
    apiKey,
    contentTypeSlug = 'products',
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [copied, setCopied] = useState(false);

    const apiRoot = (import.meta.env.VITE_API_URL as string || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    const baseUrl = `${apiRoot}/api/v1`;

    const endpointUrl = `${baseUrl}/content/${contentTypeSlug}`;

    const getCurlSnippet = () => `curl -X GET "${endpointUrl}" \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json"`;

    const getFetchSnippet = () => `// Fetch content for ${contentTypeSlug}
const response = await fetch("${endpointUrl}", {
  method: "GET",
  headers: {
    "x-api-key": "${apiKey}",
    "Content-Type": "application/json"
  }
});

const { data, meta } = await response.json();
console.log("Published items:", data);`;

    const getAstroSnippet = () => `---
// In Astro / Next.js server component
const res = await fetch("${endpointUrl}", {
  headers: { "x-api-key": "${apiKey}" },
  next: { revalidate: 60 } // ISR cache for Next.js
});
const { data: items } = await res.json();
---

<ul>
  {items.map((item) => (
    <li key={item.id}>{JSON.stringify(item.data)}</li>
  ))}
</ul>`;

    const getResponseSample = () => `{
  "status": "success",
  "message": "Content for '${contentTypeSlug}' retrieved successfully",
  "website": {
    "name": "${websiteName}",
    "domain": "${websiteDomain}"
  },
  "contentType": {
    "slug": "${contentTypeSlug}"
  },
  "items": [
    {
      "id": "item-uuid-1",
      "data": {
        "title": "Example Item",
        "price": 99.99
      },
      "createdAt": "2026-10-07T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 20,
    "page": 1
  }
}`;

    const currentCode =
        activeTab === 0
            ? getCurlSnippet()
            : activeTab === 1
            ? getFetchSnippet()
            : activeTab === 2
            ? getAstroSnippet()
            : getResponseSample();

    const handleCopy = () => {
        navigator.clipboard.writeText(currentCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{ paper: { sx: { borderRadius: 2, p: 0.5 } } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Api sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                            Headless CMS API Integration
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Query dynamic content securely using your website API Key
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: 'divider', p: 2.5 }}>
                <Stack spacing={2}>
                    {/* Endpoint URL Pill */}
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: 'action.hover',
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="GET" size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.75rem', height: 20 }} />
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem' }}>
                                {endpointUrl}
                            </Typography>
                        </Box>
                        <Chip
                            label="Auth: x-api-key"
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontSize: '0.75rem', height: 22 }}
                        />
                    </Box>

                    {/* Code Language Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_, val) => setActiveTab(val)}
                            sx={{
                                minHeight: 36,
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.8125rem',
                                    minHeight: 36,
                                    py: 0.5,
                                    px: 2,
                                },
                            }}
                        >
                            <Tab label="cURL" />
                            <Tab label="JavaScript (Fetch)" />
                            <Tab label="Astro / Next.js" />
                            <Tab label="JSON Response Preview" />
                        </Tabs>
                    </Box>

                    {/* Code Container */}
                    <Box
                        sx={{
                            position: 'relative',
                            borderRadius: 1.5,
                            bgcolor: '#0f172a',
                            color: '#f8fafc',
                            p: 2,
                            fontFamily: 'monospace',
                            fontSize: '0.8125rem',
                            overflowX: 'auto',
                            lineHeight: 1.6,
                        }}
                    >
                        <Tooltip title={copied ? 'Copied to clipboard!' : 'Copy snippet'}>
                            <IconButton
                                size="small"
                                onClick={handleCopy}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    color: copied ? '#4ade80' : '#94a3b8',
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                }}
                            >
                                {copied ? <Check sx={{ fontSize: 16 }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
                            </IconButton>
                        </Tooltip>
                        <pre style={{ margin: 0, padding: 0, fontFamily: 'inherit' }}>
                            {currentCode}
                        </pre>
                    </Box>

                    {/* Available Endpoints Helper */}
                    <Box sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
                            AVAILABLE REST ENDPOINTS & DYNAMIC FILTERS:
                        </Typography>
                        <Stack spacing={0.5}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                • <strong>GET</strong> /api/v1/content/{contentTypeSlug} &nbsp;—&nbsp; List published items
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                • <strong>GET</strong> /api/v1/content/{contentTypeSlug}?<strong>key=value</strong> &nbsp;—&nbsp; Filter dynamically by any schema field (e.g. ?in_stock=true&category=tech)
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                • <strong>GET</strong> /api/v1/content/{contentTypeSlug}/:itemId &nbsp;—&nbsp; Get single item by ID
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                • <strong>GET</strong> /api/v1/content/types &nbsp;—&nbsp; List all available content type schemas
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.25 }}>
                <Button size="small" onClick={onClose} sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8125rem' }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default HeadlessApiDocDialog;
