const SENSITIVE_KEYWORDS = [
    'apikey',
    'api_key',
    'password',
    'passwordhash',
    'token',
    'secret',
    'authorization',
    'cookie',
    'resend_api_key',
    'resendapikey',
];

function sanitizeObject(obj: any, depth = 0): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (obj instanceof Error) {
        return {
            name: obj.name,
            message: obj.message,
            stack: obj.stack,
        };
    }
    if (typeof obj !== 'object' || depth > 5) return obj;
    if (Array.isArray(obj)) return obj.map((item) => sanitizeObject(item, depth + 1));

    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
        const lowerKey = k.toLowerCase();
        if (SENSITIVE_KEYWORDS.some((kw) => lowerKey.includes(kw))) {
            clean[k] = '[REDACTED]';
        } else {
            clean[k] = sanitizeObject(v, depth + 1);
        }
    }
    return clean;
}

export class Logger {
    private static formatMessage(level: string, message: string, meta?: any): string {
        const timestamp = new Date().toISOString();
        let metaStr = '';
        if (meta !== undefined) {
            metaStr = ` | ${JSON.stringify(sanitizeObject(meta))}`;
        }
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
    }

    public static info(message: string, meta?: any): void {
        console.log(this.formatMessage('info', message, meta));
    }

    public static warn(message: string, meta?: any): void {
        console.warn(this.formatMessage('warn', message, meta));
    }

    public static error(message: string, error?: any, meta?: any): void {
        const combinedMeta = {
            ...(meta ? sanitizeObject(meta) : {}),
            ...(error ? { error: sanitizeObject(error) } : {}),
        };
        console.error(this.formatMessage('error', message, combinedMeta));
    }

    public static debug(message: string, meta?: any): void {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(this.formatMessage('debug', message, meta));
        }
    }
}
