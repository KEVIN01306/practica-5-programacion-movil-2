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
    Paper,
    Tabs,
    Tab,
    Alert,
} from '@mui/material';
import {
    Close,
    ContentCopy,
    CheckCircle,
    Code,
    Api,
    Http,
} from '@mui/icons-material';
import type { FormDto, FormFieldDto } from '../../domain/dto/forms.dto';

interface PublicFormApiDocDialogProps {
    open: boolean;
    form: FormDto;
    fields: FormFieldDto[];
    websiteDomain: string;
    apiKey: string;
    onClose: () => void;
}

export const PublicFormApiDocDialog: React.FC<PublicFormApiDocDialogProps> = ({
    open,
    form,
    fields,
    websiteDomain,
    apiKey,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [copied, setCopied] = useState(false);

    const baseUrl = window.location.origin;
    const endpointUrl = `${baseUrl}/api/v1/forms/${form.slug}/submit`;

    // Construct sample JSON body based on form's real fields
    const samplePayload: Record<string, any> = {};
    fields.forEach((f) => {
        switch (f.type) {
            case 'STRING':
                samplePayload[f.key] = f.key.includes('name')
                    ? 'John Doe'
                    : f.key.includes('email')
                    ? 'john@example.com'
                    : f.key.includes('phone')
                    ? '+1 (555) 000-1234'
                    : 'Sample text';
                break;
            case 'TEXT':
                samplePayload[f.key] = 'Hello, this is a message from the website form.';
                break;
            case 'NUMBER':
                samplePayload[f.key] = 42;
                break;
            case 'BOOLEAN':
                samplePayload[f.key] = true;
                break;
            case 'DATE':
                samplePayload[f.key] = new Date().toISOString().split('T')[0];
                break;
            case 'URL':
                samplePayload[f.key] = 'https://example.com';
                break;
            case 'JSON':
                samplePayload[f.key] = { preference: 'newsletter' };
                break;
            default:
                samplePayload[f.key] = 'Sample Value';
        }
    });

    const jsonString = JSON.stringify(samplePayload, null, 2);

    const curlSnippet = `curl -X POST "${endpointUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey || 'YOUR_WEBSITE_API_KEY'}" \\
  -d '${JSON.stringify(samplePayload)}'`;

    const jsSnippet = `const response = await fetch("${endpointUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey || 'YOUR_WEBSITE_API_KEY'}"
  },
  body: JSON.stringify(${jsonString})
});

const result = await response.json();
console.log(result);`;

    const codeToCopy = activeTab === 0 ? curlSnippet : jsSnippet;

    const handleCopy = () => {
        navigator.clipboard.writeText(codeToCopy);
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
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Api sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                            Public Form Integration API
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Form: {form.name} ({websiteDomain})
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: 'divider', p: 2.5 }}>
                <Stack spacing={2.5}>
                    <Alert severity="info" sx={{ borderRadius: 1.5, fontSize: '0.8125rem' }}>
                        This public endpoint accepts form submissions authenticated strictly via your website's API Key header (<code>x-api-key</code>).
                    </Alert>

                    {/* Endpoint URL */}
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            HTTP METHOD & ENDPOINT
                        </Typography>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                bgcolor: 'action.hover',
                            }}
                        >
                            <Box
                                sx={{
                                    px: 1,
                                    py: 0.25,
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    borderRadius: 1,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                }}
                            >
                                POST
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', wordBreak: 'break-all' }}>
                                {endpointUrl}
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Code Snippets */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Tabs
                                value={activeTab}
                                onChange={(_, val) => setActiveTab(val)}
                                sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32, py: 0.5, textTransform: 'none', fontSize: '0.8125rem' } }}
                            >
                                <Tab label="cURL Command" icon={<Http sx={{ fontSize: 16 }} />} iconPosition="start" />
                                <Tab label="JavaScript / Fetch" icon={<Code sx={{ fontSize: 16 }} />} iconPosition="start" />
                            </Tabs>

                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={copied ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
                                onClick={handleCopy}
                                sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem', py: 0.25 }}
                            >
                                {copied ? 'Copied!' : 'Copy Snippet'}
                            </Button>
                        </Box>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 1.5,
                                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0d1117' : '#fafafa'),
                                borderColor: 'divider',
                                maxHeight: 260,
                                overflow: 'auto',
                            }}
                        >
                            <Box
                                component="pre"
                                sx={{
                                    m: 0,
                                    fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
                                    fontSize: '0.75rem',
                                    lineHeight: 1.6,
                                    color: 'text.primary',
                                }}
                            >
                                {codeToCopy}
                            </Box>
                        </Paper>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.5 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PublicFormApiDocDialog;
