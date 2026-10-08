import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { ContactsRepository } from "../domain/contacts.repository.js";
import type {
    ContactEntity,
    CreateContactInput,
    UpdateContactInput,
    ListContactsFilters,
} from "../domain/contact.entity.js";
import { ContactMapper } from "./mappers/contact.mapper.js";
import { PrismaErrorMapper } from "../../../shared/db/database/prisma/PrismaErrorMapper.js";

export class PrismaContactsRepository implements ContactsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    private readonly defaultInclude = {
        website: {
            select: {
                id: true,
                name: true,
                domain: true,
            },
        },
        _count: {
            select: {
                submissions: true,
            },
        },
    };

    private readonly detailInclude = {
        website: {
            select: {
                id: true,
                name: true,
                domain: true,
            },
        },
        submissions: {
            include: {
                form: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc" as const,
            },
        },
        _count: {
            select: {
                submissions: true,
            },
        },
    };

    async create(data: CreateContactInput): Promise<ContactEntity> {
        try {
            const created = await this.prisma.contact.create({
                data: {
                    websiteId: data.websiteId,
                    email: data.email.toLowerCase().trim(),
                    firstName: data.firstName ? data.firstName.trim() : null,
                    lastName: data.lastName ? data.lastName.trim() : null,
                    phone: data.phone ? data.phone.trim() : null,
                    company: data.company ? data.company.trim() : null,
                    status: data.status || "LEAD",
                    customData: data.customData ? (data.customData as Prisma.InputJsonValue) : Prisma.DbNull,
                    tags: data.tags ? (data.tags as Prisma.InputJsonValue) : Prisma.DbNull,
                },
                include: this.detailInclude,
            });
            return ContactMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<ContactEntity | null> {
        try {
            const found = await this.prisma.contact.findUnique({
                where: { id },
                include: this.detailInclude,
            });
            return found ? ContactMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByEmail(websiteId: string, email: string): Promise<ContactEntity | null> {
        try {
            const found = await this.prisma.contact.findUnique({
                where: {
                    websiteId_email: {
                        websiteId,
                        email: email.toLowerCase().trim(),
                    },
                },
                include: this.detailInclude,
            });
            return found ? ContactMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async list(params: {
        page?: number;
        limit?: number;
        filters?: ListContactsFilters;
    }): Promise<{ data: ContactEntity[]; total: number }> {
        try {
            const page = Math.max(1, params.page || 1);
            const limit = Math.max(1, params.limit || 10);
            const skip = (page - 1) * limit;

            const where: Prisma.ContactWhereInput = {};

            if (params.filters) {
                if (params.filters.websiteId) {
                    where.websiteId = params.filters.websiteId;
                }

                if (params.filters.status) {
                    where.status = params.filters.status;
                }

                if (params.filters.search && params.filters.search.trim() !== "") {
                    const search = params.filters.search.trim();
                    where.OR = [
                        { email: { contains: search } },
                        { firstName: { contains: search } },
                        { lastName: { contains: search } },
                        { phone: { contains: search } },
                        { company: { contains: search } },
                    ];
                }
            }

            const [total, items] = await Promise.all([
                this.prisma.contact.count({ where }),
                this.prisma.contact.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: this.defaultInclude,
                }),
            ]);

            return {
                data: items.map(ContactMapper.toDomain),
                total,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateContactInput): Promise<ContactEntity> {
        try {
            const updateData: Prisma.ContactUpdateInput = {};

            if (data.firstName !== undefined) updateData.firstName = data.firstName ? data.firstName.trim() : null;
            if (data.lastName !== undefined) updateData.lastName = data.lastName ? data.lastName.trim() : null;
            if (data.phone !== undefined) updateData.phone = data.phone ? data.phone.trim() : null;
            if (data.company !== undefined) updateData.company = data.company ? data.company.trim() : null;
            if (data.status !== undefined) updateData.status = data.status;
            if (data.customData !== undefined) {
                updateData.customData = data.customData
                    ? (data.customData as Prisma.InputJsonValue)
                    : Prisma.DbNull;
            }
            if (data.tags !== undefined) {
                updateData.tags = data.tags ? (data.tags as Prisma.InputJsonValue) : Prisma.DbNull;
            }

            const updated = await this.prisma.contact.update({
                where: { id },
                data: updateData,
                include: this.detailInclude,
            });

            return ContactMapper.toDomain(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.contact.delete({
                where: { id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async count(filters?: ListContactsFilters): Promise<number> {
        try {
            const where: Prisma.ContactWhereInput = {};
            if (filters) {
                if (filters.websiteId) where.websiteId = filters.websiteId;
                if (filters.status) where.status = filters.status;
            }
            return await this.prisma.contact.count({ where });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findOrCreate(data: {
        websiteId: string;
        email: string;
        firstName?: string | null;
        lastName?: string | null;
        phone?: string | null;
    }): Promise<ContactEntity> {
        try {
            const email = data.email.toLowerCase().trim();
            const existing = await this.prisma.contact.findUnique({
                where: {
                    websiteId_email: {
                        websiteId: data.websiteId,
                        email,
                    },
                },
                include: this.defaultInclude,
            });

            if (existing) {
                // Update names or phone if previously null and provided now
                const updateData: Prisma.ContactUpdateInput = {};
                if (!existing.firstName && data.firstName) updateData.firstName = data.firstName.trim();
                if (!existing.lastName && data.lastName) updateData.lastName = data.lastName.trim();
                if (!existing.phone && data.phone) updateData.phone = data.phone.trim();

                if (Object.keys(updateData).length > 0) {
                    const updated = await this.prisma.contact.update({
                        where: { id: existing.id },
                        data: updateData,
                        include: this.defaultInclude,
                    });
                    return ContactMapper.toDomain(updated);
                }
                return ContactMapper.toDomain(existing);
            }

            const created = await this.prisma.contact.create({
                data: {
                    websiteId: data.websiteId,
                    email,
                    firstName: data.firstName ? data.firstName.trim() : null,
                    lastName: data.lastName ? data.lastName.trim() : null,
                    phone: data.phone ? data.phone.trim() : null,
                    status: "LEAD",
                },
                include: this.defaultInclude,
            });

            return ContactMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
