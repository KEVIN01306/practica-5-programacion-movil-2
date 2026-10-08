import { z } from 'zod';

export const FIELD_TYPES = [
    { value: 'STRING', label: 'Short Text (STRING)', description: 'Single line text (e.g. title, name)' },
    { value: 'TEXT', label: 'Long Text (TEXT)', description: 'Multi-line rich or plain text (e.g. description, content)' },
    { value: 'NUMBER', label: 'Number (NUMBER)', description: 'Integers or floating point numbers (e.g. price, stock)' },
    { value: 'BOOLEAN', label: 'Boolean (BOOLEAN)', description: 'True/False switch (e.g. inStock, isFeatured)' },
    { value: 'DATE', label: 'Date (DATE)', description: 'Date and time values (e.g. releaseDate, eventAt)' },
    { value: 'JSON', label: 'JSON Object / Array (JSON)', description: 'Arbitrary structured data / custom metadata' },
    { value: 'URL', label: 'URL / Link (URL)', description: 'Valid web address or media link' },
] as const;

export const contentFieldSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Field name is required')
        .max(100, 'Field name must not exceed 100 characters'),
    key: z
        .string()
        .trim()
        .min(1, 'Field key is required')
        .max(100, 'Field key must not exceed 100 characters')
        .regex(
            /^[a-z0-9_]+$/,
            'Key must contain only lowercase letters, numbers, and underscores (e.g., in_stock)'
        ),
    type: z.enum(['STRING', 'TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'JSON', 'URL'], {
        errorMap: () => ({ message: 'Please select a valid field type' }),
    }),
    isRequired: z.boolean(),
});

export type ContentFieldFormData = z.infer<typeof contentFieldSchema>;
