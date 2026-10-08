import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { FormsRepository } from "../domain/forms.repository.js";
import type {
    FormEntity,
    CreateFormInput,
    UpdateFormInput,
    ListFormsFilters,
} from "../domain/form.entity.js";
import { FormMapper } from "./mappers/form.mapper.js";
import { PrismaErrorMapper } from "../../../shared/db/database/prisma/PrismaErrorMapper.js";

export class PrismaFormsRepository implements FormsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    private readonly defaultInclude = {
        emailTemplate: true,
        _count: {
            select: {
                fields: true,
                submissions: true,
            },
        },
    };

    async create(data: CreateFormInput): Promise<FormEntity> {
        try {
            const created = await this.prisma.form.create({
                data: {
                    websiteId: data.websiteId,
                    name: data.name.trim(),
                    slug: data.slug.toLowerCase().trim(),
                    sendEmail: data.sendEmail ?? false,
                    emailFrom: data.emailFrom ? data.emailFrom.trim().toLowerCase() : null,
                    recipientEmails: data.recipientEmails ? (data.recipientEmails as Prisma.InputJsonValue) : Prisma.DbNull,
                    emailTemplateId: data.emailTemplateId || null,
                },
                include: this.defaultInclude,
            });
            return FormMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<FormEntity | null> {
        try {
            const found = await this.prisma.form.findUnique({
                where: { id },
                include: this.defaultInclude,
            });
            return found ? FormMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findBySlug(websiteId: string, slug: string): Promise<FormEntity | null> {
        try {
            const found = await this.prisma.form.findUnique({
                where: {
                    websiteId_slug: {
                        websiteId,
                        slug: slug.toLowerCase().trim(),
                    },
                },
                include: this.defaultInclude,
            });
            return found ? FormMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async list(params: {
        page?: number;
        limit?: number;
        filters?: ListFormsFilters;
    }): Promise<{ data: FormEntity[]; total: number }> {
        try {
            const page = Math.max(1, params.page || 1);
            const limit = Math.max(1, params.limit || 10);
            const skip = (page - 1) * limit;

            const where: Prisma.FormWhereInput = {};

            if (params.filters) {
                if (params.filters.websiteId) {
                    where.websiteId = params.filters.websiteId;
                }

                if (params.filters.search && params.filters.search.trim() !== "") {
                    const search = params.filters.search.trim();
                    where.OR = [
                        { name: { contains: search } },
                        { slug: { contains: search } },
                    ];
                }
            }

            const [total, items] = await Promise.all([
                this.prisma.form.count({ where }),
                this.prisma.form.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: this.defaultInclude,
                }),
            ]);

            return {
                data: items.map(FormMapper.toDomain),
                total,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateFormInput): Promise<FormEntity> {
        try {
            const updateData: Prisma.FormUpdateInput = {};

            if (data.name !== undefined) updateData.name = data.name.trim();
            if (data.slug !== undefined) updateData.slug = data.slug.toLowerCase().trim();
            if (data.sendEmail !== undefined) updateData.sendEmail = data.sendEmail;
            if (data.emailFrom !== undefined) {
                updateData.emailFrom = data.emailFrom ? data.emailFrom.trim().toLowerCase() : null;
            }
            if (data.recipientEmails !== undefined) {
                updateData.recipientEmails = data.recipientEmails
                    ? (data.recipientEmails as Prisma.InputJsonValue)
                    : Prisma.DbNull;
            }
            if (data.emailTemplateId !== undefined) {
                updateData.emailTemplate = data.emailTemplateId
                    ? { connect: { id: data.emailTemplateId } }
                    : { disconnect: true };
            }

            const updated = await this.prisma.form.update({
                where: { id },
                data: updateData,
                include: this.defaultInclude,
            });

            return FormMapper.toDomain(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.form.delete({
                where: { id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async countByWebsite(websiteId: string): Promise<number> {
        try {
            return await this.prisma.form.count({
                where: { websiteId },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
