import type { PrismaClient, Prisma } from "@prisma/client";
import type { AuditRepository } from "../domain/audit.repository.js";
import type { AuditLog, CreateAuditLog, AuditFilters } from "../domain/audit-log.entity.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import { AuditMapper } from "./mappers/audit.mapper.js";

export class PrismaAuditRepository implements AuditRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateAuditLog): Promise<AuditLog> {
        try {
            const auditLog = await this.prisma.auditLog.create({
                data: {
                    userId: data.userId || null,
                    action: data.action,
                    resource: data.resource,
                    resourceId: data.resourceId || null,
                    details: data.details !== undefined ? data.details : undefined
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            avatarUrl: true
                        }
                    }
                }
            });

            return AuditMapper.toDomain(auditLog);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAll(
        page: number,
        limit: number,
        filters?: AuditFilters
    ): Promise<{ data: AuditLog[]; total: number }> {
        try {
            const skip = Math.max(0, (page - 1) * limit);
            const where: Prisma.AuditLogWhereInput = {};

            if (filters?.action) {
                where.action = filters.action;
            }

            if (filters?.resource) {
                where.resource = filters.resource;
            }

            if (filters?.userId) {
                where.userId = filters.userId;
            }

            if (filters?.resourceId) {
                where.resourceId = filters.resourceId;
            }

            if (filters?.dateFrom || filters?.dateTo) {
                where.createdAt = {};
                if (filters.dateFrom) {
                    where.createdAt.gte = new Date(filters.dateFrom);
                }
                if (filters.dateTo) {
                    const toDate = new Date(filters.dateTo);
                    // If time is 00:00:00, extend to end of day
                    if (toDate.getHours() === 0 && toDate.getMinutes() === 0) {
                        toDate.setHours(23, 59, 59, 999);
                    }
                    where.createdAt.lte = toDate;
                }
            }

            if (filters?.q && filters.q.trim()) {
                const term = filters.q.trim();
                where.OR = [
                    { resource: { contains: term } },
                    { resourceId: { contains: term } },
                    {
                        user: {
                            OR: [
                                { email: { contains: term } },
                                { firstName: { contains: term } },
                                { lastName: { contains: term } }
                            ]
                        }
                    }
                ];
            }

            const [total, records] = await Promise.all([
                this.prisma.auditLog.count({ where }),
                this.prisma.auditLog.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                avatarUrl: true
                            }
                        }
                    }
                })
            ]);

            return {
                data: records.map((log: any) => AuditMapper.toDomain(log)),
                total
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<AuditLog | null> {
        try {
            const log = await this.prisma.auditLog.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            avatarUrl: true
                        }
                    }
                }
            });

            if (!log) return null;

            return AuditMapper.toDomain(log);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}

