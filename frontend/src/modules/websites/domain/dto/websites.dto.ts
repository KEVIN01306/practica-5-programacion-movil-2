export interface WebsiteDto {
    id: string;
    name: string;
    domain: string;
    apiKey: string;
    hostingProvider?: string | null;
    hostingNotes?: string | null;
    isActive: boolean;
    ownerId?: string | null;
    owner?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWebsiteDto {
    name: string;
    domain: string;
    hostingProvider?: string | null;
    hostingNotes?: string | null;
    isActive?: boolean;
    ownerId?: string | null;
}

export interface UpdateWebsiteDto {
    name?: string;
    domain?: string;
    hostingProvider?: string | null;
    hostingNotes?: string | null;
    isActive?: boolean;
    ownerId?: string | null;
}
