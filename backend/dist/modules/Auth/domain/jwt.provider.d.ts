import { type JWTPayload } from 'jose';
declare class JwtProvider {
    private readonly secret;
    private readonly issuer;
    private readonly audience;
    constructor();
    generateTokens(userId: string, roles: string[], permissions: string[]): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    verifyToken(token: string): Promise<JWTPayload>;
    private static readonly usedResetTokens;
    generateResetToken(userId: string, email: string): Promise<string>;
    verifyResetToken(token: string): Promise<{
        userId: string;
        email: string;
        jti: string;
    }>;
    consumeResetToken(jti: string): void;
}
export default JwtProvider;
//# sourceMappingURL=jwt.provider.d.ts.map