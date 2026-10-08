import type { PrismaClient, Prisma } from "@prisma/client";
import type { FormSubmissionsRepository } from "../domain/form-submissions.repository.js";
import type {
    FormSubmissionEntity,
    CreateFormSubmissionInput,
    UpdateFormSubmissionStatusInput,
    ListFormSubmissionsFilters,
} from "../domain/form-submission.entity.js";
import { FormSubmissionMapper } from "./mappers/form-submission.mapper.js";
import { PrismaErrorMapper } from "../../../shared/db/database/prisma/PrismaErrorMapper.js";

export class PrismaFormSubmissionsRepository implements FormSubmissionsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    private readonly defaultInclude = {
        contact: true,
        form: true,
    };

    async create(data: CreateFormSubmissionInput): Promise<FormSubmissionEntity> {
        try {
            const created = await this.prisma.formSubmission.create({
                data: {
                    formId: data.formId,
                    contactId: data.contactId || null,
                    data: data.data as Prisma.InputJsonValue,
                    status: data.status ?? "PENDING",
                },
                include: this.defaultInclude,
            });
            return FormSubmissionMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<FormSubmissionEntity | null> {
        try {
            const found = await this.prisma.formSubmission.findUnique({
                where: { id },
                include: this.defaultInclude,
            });
            return found ? FormSubmissionMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async list(params: {
        page?: number;
        limit?: number;
        filters?: ListFormSubmissionsFilters;
    }): Promise<{ data: FormSubmissionEntity[]; total: number }> {
        try {
            const page = Math.max(1, params.page || 1);
            const limit = Math.max(1, params.limit || 10);
            const skip = (page - 1) * limit;

            const where: Prisma.FormSubmissionWhereInput = {};

            if (params.filters) {
                if (params.filters.formId) {
                    where.formId = params.filters.formId;
                }

                if (params.filters.websiteId) {
                    where.form = { websiteId: params.filters.websiteId };
                }

                if (params.filters.status) {
                    where.status = params.filters.status;
                }

                if (params.filters.search && params.filters.search.trim() !== "") {
                    const search = params.filters.search.trim();
                    where.OR = [
                        { contact: { email: { contains: search } } },
                        { contact: { firstName: { contains: search } } },
                        { contact: { lastName: { contains: search } } },
                    ];
                }
            }

            const [total, items] = await Promise.all([
                this.prisma.formSubmission.count({ where }),
                this.prisma.formSubmission.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: this.defaultInclude,
                }),
            ]);

            return {
                data: items.map(FormSubmissionMapper.toDomain),
                total,
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async updateStatus(
        id: string,
        data: UpdateFormSubmissionStatusInput
    ): Promise<FormSubmissionEntity> {
        try {
            const updated = await this.prisma.formSubmission.update({
                where: { id },
                data: { status: data.status },
                include: this.defaultInclude,
            });
            return FormSubmissionMapper.toDomain(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.formSubmission.delete({
                where: { id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async countByFormId(formId: string): Promise<number> {
        try {
            return await this.prisma.formSubmission.count({
                where: { formId },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
