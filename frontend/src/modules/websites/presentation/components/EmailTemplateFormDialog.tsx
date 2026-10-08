import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Box,
    Typography,
    Alert,
    CircularProgress,
    IconButton,
    Chip,
    Tooltip,
    Menu,
    MenuItem,
    ToggleButtonGroup,
    ToggleButton,
    Paper,
} from '@mui/material';
import {
    Close,
    Code,
    Visibility,
    VerticalSplit,
    AutoAwesome,
    Add,
    InfoOutlined,
    Fullscreen,
    FullscreenExit,
} from '@mui/icons-material';
import {
    EmailTemplateFormSchema,
    type EmailTemplateFormData,
} from '../../infrastructure/schemas/email-template.schema';
import {
    createEmailTemplate,
    updateEmailTemplate,
} from '../../infrastructure/services/email-templates.service';
import type { EmailTemplateDto } from '../../domain/dto/email-templates.dto';
import { EmailTemplatePreview } from './EmailTemplatePreview';
import { EMAIL_PRESETS } from './email-template-presets';

interface EmailTemplateFormDialogProps {
    open: boolean;
    websiteId: string;
    websiteName: string;
    template?: EmailTemplateDto | null;
    onClose: () => void;
    onSuccess: (template: EmailTemplateDto) => void;
}

type ViewMode = 'split' | 'code' | 'preview';

export const EmailTemplateFormDialog: React.FC<EmailTemplateFormDialogProps> = ({
    open,
    websiteId,
    websiteName,
    template,
    onClose,
    onSuccess,
}) => {
    const isEdit = Boolean(template);
    const [viewMode, setViewMode] = useState<ViewMode>('split');
    const [fullScreen, setFullScreen] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [presetAnchorEl, setPresetAnchorEl] = useState<null | HTMLElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<EmailTemplateFormData>({
        resolver: zodResolver(EmailTemplateFormSchema),
        defaultValues: {
            name: '',
            subject: '',
            htmlContent: '',
        },
    });

    const watchedName = watch('name');
    const watchedSubject = watch('subject');
    const watchedHtmlContent = watch('htmlContent');

    useEffect(() => {
        if (open) {
            setServerError(null);
            if (template) {
                reset({
                    name: template.name,
                    subject: template.subject,
                    htmlContent: template.htmlContent,
                });
            } else {
                // Default to first preset
                const defaultPreset = EMAIL_PRESETS[0];
                reset({
                    name: '',
                    subject: '',
                    htmlContent: defaultPreset.htmlContent,
                });
            }
        }
    }, [open, template, reset]);

    const handleApplyPreset = (presetId: string) => {
        const preset = EMAIL_PRESETS.find((p) => p.id === presetId);
        if (preset) {
            if (!watchedName) setValue('name', preset.name, { shouldValidate: true });
            if (!watchedSubject) setValue('subject', preset.subject, { shouldValidate: true });
            setValue('htmlContent', preset.htmlContent, { shouldValidate: true });
        }
        setPresetAnchorEl(null);
    };

    const handleInsertSnippet = (snippet: string) => {
        const currentHtml = watchedHtmlContent || '';
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const updated = currentHtml.substring(0, start) + snippet + currentHtml.substring(end);
            setValue('htmlContent', updated, { shouldValidate: true });
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + snippet.length, start + snippet.length);
            }, 0);
        } else {
            setValue('htmlContent', currentHtml + snippet, { shouldValidate: true });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // Support Tab key indentation inside the editor
        if (e.key === 'Tab') {
            e.preventDefault();
            handleInsertSnippet('  ');
        }
    };

    const onSubmit = async (data: EmailTemplateFormData) => {
        setServerError(null);
        try {
            if (isEdit && template) {
                const updated = await updateEmailTemplate(template.id, {
                    name: data.name,
                    subject: data.subject,
                    htmlContent: data.htmlContent,
                });
                onSuccess(updated);
            } else {
                const created = await createEmailTemplate(websiteId, {
                    name: data.name,
                    subject: data.subject,
                    htmlContent: data.htmlContent,
                });
                onSuccess(created);
            }
            onClose();
        } catch (err: any) {
            setServerError(
                err.response?.data?.message || 'An error occurred while saving the email template'
            );
        }
    };

    return (
        <Dialog
            open={open}
            onClose={isSubmitting ? undefined : onClose}
            maxWidth={fullScreen ? false : 'xl'}
            fullWidth
            fullScreen={fullScreen}
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: fullScreen ? 0 : 2,
                        height: fullScreen ? '100vh' : '90vh',
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
                    <Code sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {isEdit ? 'Edit Email Template' : 'Create New Email Template'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Website: {websiteName}
                        </Typography>
                    </Box>
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    {/* View mode toggle */}
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, val) => val && setViewMode(val)}
                        size="small"
                        sx={{
                            height: 30,
                            display: { xs: 'none', md: 'inline-flex' },
                            '& .MuiToggleButton-root': {
                                px: 1.25,
                                py: 0,
                                fontSize: '0.75rem',
                                textTransform: 'none',
                                gap: 0.5,
                            },
                        }}
                    >
                        <ToggleButton value="split">
                            <VerticalSplit sx={{ fontSize: 16 }} />
                            Split View
                        </ToggleButton>
                        <ToggleButton value="code">
                            <Code sx={{ fontSize: 16 }} />
                            Code Only
                        </ToggleButton>
                        <ToggleButton value="preview">
                            <Visibility sx={{ fontSize: 16 }} />
                            Preview Only
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <IconButton
                        size="small"
                        onClick={() => setFullScreen(!fullScreen)}
                        title={fullScreen ? 'Exit Full Screen' : 'Full Screen'}
                    >
                        {fullScreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
                    </IconButton>

                    <IconButton onClick={onClose} disabled={isSubmitting} size="small">
                        <Close fontSize="small" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
            >
                <DialogContent
                    sx={{
                        p: 2.5,
                        flex: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    {serverError && (
                        <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                            {serverError}
                        </Alert>
                    )}

                    {/* Metadata Header Inputs */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 1.5,
                            borderColor: 'divider',
                            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
                        }}
                    >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Template Name"
                                        placeholder="e.g. Contact Form Notification"
                                        size="small"
                                        fullWidth
                                        disabled={isSubmitting}
                                        error={Boolean(errors.name)}
                                        helperText={errors.name?.message}
                                        sx={{ bgcolor: 'background.paper' }}
                                    />
                                )}
                            />

                            <Controller
                                name="subject"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Email Subject Line"
                                        placeholder="e.g. New contact from {{name}}"
                                        size="small"
                                        fullWidth
                                        disabled={isSubmitting}
                                        error={Boolean(errors.subject)}
                                        helperText={errors.subject?.message || 'Supports dynamic variables like {{name}}'}
                                        sx={{ bgcolor: 'background.paper' }}
                                    />
                                )}
                            />
                        </Stack>
                    </Paper>

                    {/* Toolbar for Editor & Variables */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1,
                        }}
                    >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AutoAwesome fontSize="small" />}
                                onClick={(e) => setPresetAnchorEl(e.currentTarget)}
                                sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem', py: 0.25 }}
                            >
                                Starter Templates
                            </Button>
                            <Menu
                                anchorEl={presetAnchorEl}
                                open={Boolean(presetAnchorEl)}
                                onClose={() => setPresetAnchorEl(null)}
                            >
                                {EMAIL_PRESETS.map((preset) => (
                                    <MenuItem
                                        key={preset.id}
                                        onClick={() => handleApplyPreset(preset.id)}
                                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {preset.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {preset.description}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Menu>

                            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1, fontWeight: 600 }}>
                                Insert Snippets:
                            </Typography>
                            {['{{name}}', '{{email}}', '{{subject}}', '{{message}}'].map((variable) => (
                                <Chip
                                    key={variable}
                                    label={variable}
                                    size="small"
                                    onClick={() => handleInsertSnippet(variable)}
                                    icon={<Add sx={{ fontSize: '13px !important' }} />}
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        bgcolor: 'action.hover',
                                        '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' },
                                    }}
                                />
                            ))}
                        </Stack>

                        <Tooltip title="HTML email templates can contain HTML tags, inline styles, and dynamic handlebar tags {{variable}}. Javascript will be isolated in preview for security.">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                <InfoOutlined sx={{ fontSize: 16 }} />
                                <Typography variant="caption">HTML5 & Inline CSS Supported</Typography>
                            </Box>
                        </Tooltip>
                    </Box>

                    {/* Split Pane: Code Editor + Live Preview */}
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 400,
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md:
                                    viewMode === 'split'
                                        ? '1fr 1fr'
                                        : viewMode === 'code'
                                        ? '1fr'
                                        : '0 1fr',
                            },
                            gap: 2,
                        }}
                    >
                        {/* Editor Column */}
                        {(viewMode === 'split' || viewMode === 'code') && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <Controller
                                    name="htmlContent"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            inputRef={(ref) => {
                                                field.ref(ref);
                                                textareaRef.current = ref;
                                            }}
                                            onKeyDown={handleKeyDown}
                                            multiline
                                            fullWidth
                                            placeholder="Write or paste your HTML email template here..."
                                            error={Boolean(errors.htmlContent)}
                                            helperText={errors.htmlContent?.message}
                                            slotProps={{
                                                input: {
                                                    sx: {
                                                        fontFamily:
                                                            '"Fira Code", "JetBrains Mono", Consolas, "Courier New", monospace',
                                                        fontSize: '0.8125rem',
                                                        lineHeight: 1.6,
                                                        height: '100%',
                                                        alignItems: 'flex-start',
                                                        bgcolor: (theme) =>
                                                            theme.palette.mode === 'dark' ? '#0d1117' : '#fafafa',
                                                        '& textarea': {
                                                            height: '100% !important',
                                                            overflowY: 'auto !important',
                                                        },
                                                    },
                                                },
                                            }}
                                            sx={{
                                                height: '100%',
                                                flex: 1,
                                                '& .MuiInputBase-root': {
                                                    height: '100%',
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        )}

                        {/* Live Preview Column */}
                        {(viewMode === 'split' || viewMode === 'preview') && (
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <EmailTemplatePreview
                                    htmlContent={watchedHtmlContent || ''}
                                    subject={watchedSubject}
                                    websiteName={websiteName}
                                    height="100%"
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 2.5,
                        py: 1.5,
                        borderTop: 1,
                        borderColor: 'divider',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        {watchedHtmlContent ? `${watchedHtmlContent.length} characters` : 'Empty template'}
                    </Typography>

                    <Stack direction="row" spacing={1.5}>
                        <Button
                            onClick={onClose}
                            disabled={isSubmitting}
                            variant="outlined"
                            size="small"
                            sx={{ textTransform: 'none', borderRadius: 1.5 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            size="small"
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
                            sx={{ textTransform: 'none', borderRadius: 1.5, px: 2.5 }}
                        >
                            {isEdit ? 'Save Changes' : 'Create Template'}
                        </Button>
                    </Stack>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EmailTemplateFormDialog;
