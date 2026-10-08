import type { Contact as PrismaContact } from "@prisma/client";
import type { ContactEntity } from "../../domain/contact.entity.js";

export class ContactMapper {
    static toDomain(raw: PrismaContact): ContactEntity {
        let tags: string[] | null = null;
        if (Array.isArray(raw.tags)) {
            tags = raw.tags as string[];
        }

        let customData: Record<string, any> | null = null;
        if (raw.customData && typeof raw.customData === "object") {
            customData = raw.customData as Record<string, any>;
        }

        return {
            id: raw.id,
            websiteId: raw.websiteId,
            email: raw.email,
            firstName: raw.firstName,
            lastName: raw.lastName,
            phone: raw.phone,
            company: raw.company,
            status: raw.status,
            customData,
            tags,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
    }
}
