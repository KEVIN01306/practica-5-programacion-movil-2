import crypto from 'node:crypto';

const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const NUMBERS = '23456789';
const SYMBOLS = '!@#$%&*';
const ALL_CHARS = UPPERCASE + LOWERCASE + NUMBERS + SYMBOLS;

/**
 * Generates a cryptographically secure random password complying with system security policies.
 * Guarantees at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol.
 */
export function generateSecurePassword(length: number = 12): string {
    const minLength = Math.max(8, length);
    const passwordChars: string[] = [];

    // Ensure at least one character from each required category
    passwordChars.push(UPPERCASE.charAt(crypto.randomInt(0, UPPERCASE.length)));
    passwordChars.push(LOWERCASE.charAt(crypto.randomInt(0, LOWERCASE.length)));
    passwordChars.push(NUMBERS.charAt(crypto.randomInt(0, NUMBERS.length)));
    passwordChars.push(SYMBOLS.charAt(crypto.randomInt(0, SYMBOLS.length)));

    // Fill remaining positions
    for (let i = passwordChars.length; i < minLength; i++) {
        passwordChars.push(ALL_CHARS.charAt(crypto.randomInt(0, ALL_CHARS.length)));
    }

    // Cryptographically shuffle the array (Fisher-Yates)
    for (let i = passwordChars.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        const temp = passwordChars[i] ?? '';
        passwordChars[i] = passwordChars[j] ?? '';
        passwordChars[j] = temp;
    }

    return passwordChars.join('');
}
