export interface AuthUser {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role?: string;
    roles?: string[];
    permissions: string[];
    isActive?: boolean;
    createdAt?: string | Date;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
}
