import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import { Close, Visibility } from '@mui/icons-material';
import type { EmailTemplateDto } from '../../domain/dto/email-templates.dto';
import { EmailTemplatePreview } from './EmailTemplatePreview';

interface EmailTemplatePreviewDialogProps {
    open: boolean;
    template: EmailTemplateDto | null;
    websiteName: string;
    websiteDomain?: string;
    onClose: () => void;
    onEdit?: (template: EmailTemplateDto) => void;
}

export const EmailTemplatePreviewDialog: React.FC<EmailTemplatePreviewDialogProps> = ({
    open,
    template,
    websiteName,
    websiteDomain,
    onClose,
    onEdit,
}) => {
    if (!template) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 2,
                        height: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    px: 2.5,
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Visibility sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {template.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Subject: {template.subject}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 2, flex: 1, overflow: 'hidden' }}>
                <EmailTemplatePreview
                    htmlContent={template.htmlContent}
                    subject={template.subject}
                    websiteName={websiteName}
                    websiteDomain={websiteDomain}
                    height="100%"
                />
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                    Close
                </Button>
                {onEdit && (
                    <Button
                        onClick={() => {
                            onClose();
                            onEdit(template);
                        }}
                        variant="contained"
                        size="small"
                        sx={{ textTransform: 'none', borderRadius: 1.5 }}
                    >
                        Edit Template
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default EmailTemplatePreviewDialog;
