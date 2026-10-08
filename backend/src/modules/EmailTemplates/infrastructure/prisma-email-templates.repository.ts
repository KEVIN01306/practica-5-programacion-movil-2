import type { PrismaClient, Prisma } from "@prisma/client";
import type { EmailTemplatesRepository } from "../domain/email-templates.repository.js";
import type {
    EmailTemplateEntity,
    CreateEmailTemplateInput,
    UpdateEmailTemplateInput,
    ListEmailTemplatesFilters,
} from "../domain/email-template.entity.js";
import { EmailTemplateMapper } from "./mappers/email-template.mapper.js";
import { PrismaErrorMapper } from "../../../shared/db/database/prisma/PrismaErrorMapper.js";

export class PrismaEmailTemplatesRepository implements EmailTemplatesRepository {
    constructor(private readonly prisma: PrismaClient) {}

    private readonly defaultInclude = {
        _count: {
            select: {
                forms: true,
            },
        },
    };

    async create(data: CreateEmailTemplateInput): Promise<EmailTemplateEntity> {
        try {
            const created = await this.prisma.emailTemplate.create({
                data: {
                    websiteId: data.websiteId,
                    name: data.name.trim(),
                    subject: data.subject.trim(),
                    htmlContent: data.htmlContent,
                },
                include: this.defaultInclude,
            });
            return EmailTemplateMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<EmailTemplateEntity | null> {
        try {
            const found = await this.prisma.emailTemplate.findUnique({
                where: { id },
                include: this.defaultInclude,
            });
            return found ? EmailTemplateMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async list(params: {
        page?: number;
        limit?: number;
        filters?: ListEmailTemplatesFilters;
    }): Promise<{ data: EmailTemplateEntity[]; total: number }> {
        try {
            const page = Math.max(1, params.page || 1);
            const limit = Math.max(1, params.limit || 10);
            const skip = (page - 1) * limit;

            const where: Prisma.EmailTemplateWhereInput = {};

            if (params.filters) {
                if (params.filters.websiteId) {
                    where.websiteId = params.filters.websiteId;
                }

                if (params.filters.search && params.filters.search.trim() !== "") {
                    const search = params.filters.search.trim();
                    where.OR = [
                        { name: { contains: search } },
                        { subject: { contains: search } },
                        { htmlContent: { contains: search } },
                    ];
                }
            }

            const [total, items] = await Promise.all([
                this.prisma.emailTemplate.count({ where }),
                this.prisma.emailTemplate.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: this.defaultInclude,
                }),
            ]);

            return {
                data: items.map(EmailTemplateMapper.toDomain),
                total,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateEmailTemplateInput): Promise<EmailTemplateEntity> {
        try {
            const updateData: Prisma.EmailTemplateUpdateInput = {};

            if (data.name !== undefined) updateData.name = data.name.trim();
            if (data.subject !== undefined) updateData.subject = data.subject.trim();
            if (data.htmlContent !== undefined) updateData.htmlContent = data.htmlContent;

            const updated = await this.prisma.emailTemplate.update({
                where: { id },
                data: updateData,
                include: this.defaultInclude,
            });

            return EmailTemplateMapper.toDomain(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.emailTemplate.delete({
                where: { id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async countByWebsite(websiteId: string): Promise<number> {
        try {
            return await this.prisma.emailTemplate.count({
                where: { websiteId },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
