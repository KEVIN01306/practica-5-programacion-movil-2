import type { PrismaClient } from "@prisma/client";
import type { CategoriesRepository } from "../domain/categories.repository.js";
import type { Category, CreateCategory, UpdateCategory } from "../domain/category.entity.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import { CategoriesMapper } from "./mappers/categories.mapper.js";

export class PrismaCategoriesRepository implements CategoriesRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateCategory): Promise<Category> {
        try {
            const raw = await this.prisma.category.create({
                data: {
                    name: data.name,
                    description: data.description ?? null,
                }
            });
            return CategoriesMapper.toDomain(raw);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateCategory): Promise<Category> {
        try {
            const raw = await this.prisma.category.update({
                where: { id },
                data: {
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.description !== undefined && { description: data.description }),
                }
            });
            return CategoriesMapper.toDomain(raw);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.category.delete({
                where: { id }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<Category | null> {
        try {
            const raw = await this.prisma.category.findUnique({
                where: { id }
            });
            return raw ? CategoriesMapper.toDomain(raw) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByName(name: string): Promise<Category | null> {
        try {
            const raw = await this.prisma.category.findUnique({
                where: { name }
            });
            return raw ? CategoriesMapper.toDomain(raw) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAll(): Promise<Category[]> {
        try {
            const list = await this.prisma.category.findMany({
                orderBy: { name: "asc" }
            });
            return list.map(CategoriesMapper.toDomain);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
