/**
 * TemplateRenderer
 * Safe textual template engine for interpolating submission data into email subjects and HTML bodies.
 * Replaces tokens like {{name}}, {{ email }}, {{ custom_field }} safely without eval or JavaScript execution.
 */
export class TemplateRenderer {
    private static readonly VARIABLE_REGEX = /\{\{\s*([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*)\s*\}\}/g;

    /**
     * Interpolates data values into a template string.
     * Non-existent or null/undefined variables resolve to an empty string.
     */
    public static render(template: string | null | undefined, data: Record<string, any>): string {
        if (!template) return '';
        if (!data || typeof data !== 'object') return template;

        return template.replace(this.VARIABLE_REGEX, (match, key) => {
            const value = this.resolveValue(data, key);
            if (value === null || value === undefined) {
                return '';
            }
            if (typeof value === 'object') {
                return JSON.stringify(value);
            }
            return String(value);
        });
    }

    private static resolveValue(data: Record<string, any>, path: string): any {
        // Direct property match (e.g. data["first_name"] or data["name"])
        if (path in data) {
            return data[path];
        }

        // Case-insensitive fallback
        const lowerPath = path.toLowerCase();
        for (const [k, v] of Object.entries(data)) {
            if (k.toLowerCase() === lowerPath) {
                return v;
            }
        }

        // Dot notation support (e.g. data["contact.email"])
        if (path.includes('.')) {
            const parts = path.split('.');
            let current: any = data;
            for (const part of parts) {
                if (current === null || current === undefined || typeof current !== 'object') {
                    return undefined;
                }
                current = current[part];
            }
            return current;
        }

        return undefined;
    }
}
