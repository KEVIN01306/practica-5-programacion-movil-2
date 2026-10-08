export interface WebsiteEntity {
    id: string;
    name: string;
    domain: string;
    apiKey: string;
    hostingProvider: string | null;
    hostingNotes: string | null;
    isActive: boolean;
    ownerId: string | null;
    owner?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateWebsiteInput {
    name: string;
    domain: string;
    apiKey?: string;
    hostingProvider?: string | null;
    hostingNotes?: string | null;
    isActive?: boolean;
    ownerId?: string | null;
}

export interface UpdateWebsiteInput {
    name?: string;
    domain?: string;
    apiKey?: string;
    hostingProvider?: string | null;
    hostingNotes?: string | null;
    isActive?: boolean;
    ownerId?: string | null;
}

export interface ListWebsitesFilters {
    search?: string;
    isActive?: boolean;
    ownerId?: string;
}
