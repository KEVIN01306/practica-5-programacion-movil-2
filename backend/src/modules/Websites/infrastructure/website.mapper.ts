import type { Website, User } from "@prisma/client";
import type { WebsiteEntity } from "../domain/website.entity.js";

type PrismaWebsiteWithOwner = Website & {
    owner?: Pick<User, "id" | "firstName" | "lastName" | "email"> | null;
};

export class WebsiteMapper {
    public static toDomain(raw: PrismaWebsiteWithOwner): WebsiteEntity {
        return {
            id: raw.id,
            name: raw.name,
            domain: raw.domain,
            apiKey: raw.apiKey,
            hostingProvider: raw.hostingProvider,
            hostingNotes: raw.hostingNotes,
            isActive: raw.isActive,
            ownerId: raw.ownerId,
            owner: raw.owner
                ? {
                      id: raw.owner.id,
                      firstName: raw.owner.firstName,
                      lastName: raw.owner.lastName,
                      email: raw.owner.email,
                  }
                : null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
    }
}
