import type { PrismaClient, Prisma } from "@prisma/client";
import type { FormFieldsRepository } from "../domain/form-fields.repository.js";
import type {
    FormFieldEntity,
    CreateFormFieldInput,
    UpdateFormFieldInput,
} from "../domain/form-field.entity.js";
import { FormFieldMapper } from "./mappers/form-field.mapper.js";
import { PrismaErrorMapper } from "../../../shared/db/database/prisma/PrismaErrorMapper.js";

export class PrismaFormFieldsRepository implements FormFieldsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateFormFieldInput): Promise<FormFieldEntity> {
        try {
            const created = await this.prisma.formField.create({
                data: {
                    formId: data.formId,
                    label: data.label.trim(),
                    key: data.key.trim().toLowerCase(),
                    type: data.type,
                    isRequired: data.isRequired ?? false,
                },
            });
            return FormFieldMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<FormFieldEntity | null> {
        try {
            const found = await this.prisma.formField.findUnique({
                where: { id },
            });
            return found ? FormFieldMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByKey(formId: string, key: string): Promise<FormFieldEntity | null> {
        try {
            const found = await this.prisma.formField.findUnique({
                where: {
                    formId_key: {
                        formId,
                        key: key.trim().toLowerCase(),
                    },
                },
            });
            return found ? FormFieldMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listByFormId(formId: string): Promise<FormFieldEntity[]> {
        try {
            const items = await this.prisma.formField.findMany({
                where: { formId },
                orderBy: { createdAt: "asc" },
            });
            return items.map(FormFieldMapper.toDomain);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateFormFieldInput): Promise<FormFieldEntity> {
        try {
            const updateData: Prisma.FormFieldUpdateInput = {};

            if (data.label !== undefined) updateData.label = data.label.trim();
            if (data.key !== undefined) updateData.key = data.key.trim().toLowerCase();
            if (data.type !== undefined) updateData.type = data.type;
            if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;

            const updated = await this.prisma.formField.update({
                where: { id },
                data: updateData,
            });

            return FormFieldMapper.toDomain(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.formField.delete({
                where: { id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async bulkCreate(
        formId: string,
        fields: Omit<CreateFormFieldInput, "formId">[]
    ): Promise<FormFieldEntity[]> {
        try {
            const results: FormFieldEntity[] = [];
            for (const field of fields) {
                const created = await this.prisma.formField.create({
                    data: {
                        formId,
                        label: field.label.trim(),
                        key: field.key.trim().toLowerCase(),
                        type: field.type,
                        isRequired: field.isRequired ?? false,
                    },
                });
                results.push(FormFieldMapper.toDomain(created));
            }
            return results;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
