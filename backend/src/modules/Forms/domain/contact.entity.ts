import type { ContactStatus } from "@prisma/client";

export interface ContactEntity {
    id: string;
    websiteId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    company: string | null;
    status: ContactStatus;
    customData: Record<string, any> | null;
    tags: string[] | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface FindOrCreateContactInput {
    websiteId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
}
