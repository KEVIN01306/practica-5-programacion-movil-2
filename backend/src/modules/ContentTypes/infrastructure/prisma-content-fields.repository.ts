import type { PrismaClient, Prisma, FieldType as PrismaFieldType } from "@prisma/client";
import type { ContentFieldsRepository } from "../domain/content-fields.repository.js";
import type {
    ContentFieldEntity,
    CreateContentFieldInput,
    UpdateContentFieldInput,
} from "../domain/content-field.entity.js";
import { ContentFieldMapper } from "./mappers/content-field.mapper.js";
import { PrismaErrorMapper } from "../../../shared/db/database/prisma/PrismaErrorMapper.js";

export class PrismaContentFieldsRepository implements ContentFieldsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateContentFieldInput): Promise<ContentFieldEntity> {
        try {
            const created = await this.prisma.contentField.create({
                data: {
                    contentTypeId: data.contentTypeId,
                    name: data.name.trim(),
                    key: data.key.toLowerCase().trim(),
                    type: data.type as PrismaFieldType,
                    isRequired: data.isRequired ?? false,
                },
            });
            return ContentFieldMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<ContentFieldEntity | null> {
        try {
            const found = await this.prisma.contentField.findUnique({
                where: { id },
            });
            return found ? ContentFieldMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByKey(contentTypeId: string, key: string): Promise<ContentFieldEntity | null> {
        try {
            const found = await this.prisma.contentField.findUnique({
                where: {
                    contentTypeId_key: {
                        contentTypeId,
                        key: key.toLowerCase().trim(),
                    },
                },
            });
            return found ? ContentFieldMapper.toDomain(found) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listByContentType(contentTypeId: string): Promise<ContentFieldEntity[]> {
        try {
            const items = await this.prisma.contentField.findMany({
                where: { contentTypeId },
                orderBy: { createdAt: "asc" },
            });
            return items.map(ContentFieldMapper.toDomain);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateContentFieldInput): Promise<ContentFieldEntity> {
        try {
            const updateData: Prisma.ContentFieldUpdateInput = {};

            if (data.name !== undefined) updateData.name = data.name.trim();
            if (data.key !== undefined) updateData.key = data.key.toLowerCase().trim();
            if (data.type !== undefined) updateData.type = data.type as PrismaFieldType;
            if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;

            const updated = await this.prisma.contentField.update({
                where: { id },
                data: updateData,
            });

            return ContentFieldMapper.toDomain(updated);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.contentField.delete({
                where: { id },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async countByContentType(contentTypeId: string): Promise<number> {
        try {
            return await this.prisma.contentField.count({
                where: { contentTypeId },
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
