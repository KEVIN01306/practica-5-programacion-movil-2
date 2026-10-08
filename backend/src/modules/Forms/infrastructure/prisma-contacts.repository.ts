import type { PrismaClient } from "@prisma/client";
import type { ContactsRepository } from "../domain/contacts.repository.js";
import type {
    ContactEntity,
    FindOrCreateContactInput,
} from "../domain/contact.entity.js";
import { ContactMapper } from "./mappers/contact.mapper.js";
import { PrismaErrorMapper } from "../../../shared/db/database/prisma/PrismaErrorMapper.js";

export class PrismaContactsRepository implements ContactsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findByEmail(websiteId: string, email: string): Promise<ContactEntity | null> {
        try {
            const found = await this.prisma.contact.findUnique({
                where: {
                    websiteId_email: {
                        websiteId,
                        email: email.trim().toLowerCase(),
                    },
                },
            });
            return found ? ContactMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<ContactEntity | null> {
        try {
            const found = await this.prisma.contact.findUnique({
                where: { id },
            });
            return found ? ContactMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findOrCreate(data: FindOrCreateContactInput): Promise<ContactEntity> {
        try {
            const normalizedEmail = data.email.trim().toLowerCase();
            const existing = await this.prisma.contact.findUnique({
                where: {
                    websiteId_email: {
                        websiteId: data.websiteId,
                        email: normalizedEmail,
                    },
                },
            });

            if (existing) {
                // Update optional fields if provided and not previously set
                const updateData: any = {};
                if (data.firstName && !existing.firstName) updateData.firstName = data.firstName.trim();
                if (data.lastName && !existing.lastName) updateData.lastName = data.lastName.trim();
                if (data.phone && !existing.phone) updateData.phone = data.phone.trim();

                if (Object.keys(updateData).length > 0) {
                    const updated = await this.prisma.contact.update({
                        where: { id: existing.id },
                        data: updateData,
                    });
                    return ContactMapper.toDomain(updated);
                }

                return ContactMapper.toDomain(existing);
            }

            const created = await this.prisma.contact.create({
                data: {
                    websiteId: data.websiteId,
                    email: normalizedEmail,
                    firstName: data.firstName?.trim() || null,
                    lastName: data.lastName?.trim() || null,
                    phone: data.phone?.trim() || null,
                    status: "LEAD",
                },
            });

            return ContactMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
