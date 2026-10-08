import type { PrismaClient } from "@prisma/client";
import type { UsersRepository } from "../domain/users.repository.js";
import type { User, CreateUser, UpdateUser, GetUser, GetSimpleUser } from "../domain/user.entity.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import { UsersMapper } from "./mappers/users.mapper.js";

export class PrismaUsersRepository implements UsersRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async create(data: CreateUser): Promise<GetUser> {
        try {
            const roleNames = data.roles && data.roles.length > 0 ? data.roles : ['USER'];
            const user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    passwordHash: data.passwordHash,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    isActive: true,
                    isVerify: data.isVerify !== undefined ? data.isVerify : false,
                    userRoles: {
                        create: roleNames.map(name => ({
                            role: {
                                connect: { name }
                            }
                        }))
                    }
                },
                include: {
                    userRoles: {
                        select: {
                            role: { select: { name: true } }
                        }
                    }
                }
            });
            return UsersMapper.toGetUser(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateUser): Promise<GetUser> {
        try {
            if (data.roles !== undefined) {
                await this.prisma.userRole.deleteMany({
                    where: { userId: id }
                });
                if (data.roles.length > 0) {
                    const roles = await this.prisma.role.findMany({
                        where: { name: { in: data.roles } }
                    });
                    if (roles.length > 0) {
                        await this.prisma.userRole.createMany({
                            data: roles.map((r: any) => ({
                                userId: id,
                                roleId: r.id
                            }))
                        });
                    }
                }
            }

            const user = await this.prisma.user.update({
                where: { id },
                data: {
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    passwordHash: data.passwordHash
                },
                include: {
                    userRoles: {
                        select: {
                            role: { select: { name: true } }
                        }
                    }
                }
            });
            return UsersMapper.toGetUser(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<GetUser | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
                include: {
                    userRoles: {
                        select: {
                            role: { select: { name: true } }
                        }
                    }
                }
            });
            return user ? UsersMapper.toGetUser(user) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email }
            });
            return user ? UsersMapper.toDomain(user) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAll(): Promise<GetSimpleUser[]> {
        try {
            const users = await this.prisma.user.findMany({
                include: {
                    userRoles: {
                        select: {
                            role: { select: { name: true } }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return users.map((user: any) => UsersMapper.toGetSimpleUser(user));
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAllPaginated(
        page: number = 1,
        limit: number = 10,
        filters?: { q?: string }
    ): Promise<{ data: GetSimpleUser[]; total: number }> {
        try {
            const offset = (page - 1) * limit;
            const whereClause: any = {};
            if (filters?.q) {
                const query = filters.q.trim();
                whereClause.OR = [
                    { email: { contains: query } },
                    { firstName: { contains: query } },
                    { lastName: { contains: query } }
                ];
            }

            const [users, total] = await Promise.all([
                this.prisma.user.findMany({
                    where: whereClause,
                    skip: offset,
                    take: limit,
                    include: {
                        userRoles: {
                            select: {
                                role: { select: { name: true } }
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                this.prisma.user.count({ where: whereClause })
            ]);

            return {
                data: users.map((user: any) => UsersMapper.toGetSimpleUser(user)),
                total
            };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAllRoles(): Promise<{ id: string; name: string; description: string | null }[]> {
        try {
            return await this.prisma.role.findMany({
                select: { id: true, name: true, description: true },
                orderBy: { name: 'asc' }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async activate(id: string): Promise<GetUser> {
        try {
            const user = await this.prisma.user.update({
                where: { id },
                data: { isActive: true },
                include: {
                    userRoles: {
                        select: {
                            role: { select: { name: true } }
                        }
                    }
                }
            });
            return UsersMapper.toGetUser(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findByIdWithPassword(id: string): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id }
            });
            return user ? UsersMapper.toDomain(user) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async updatePassword(id: string, passwordHash: string): Promise<void> {
        try {
            await this.prisma.user.update({
                where: { id },
                data: { passwordHash }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async updateVerification(id: string, isVerify: boolean): Promise<void> {
        try {
            await this.prisma.user.update({
                where: { id },
                data: { isVerify }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async disable(id: string): Promise<GetUser> {
        try {
            const user = await this.prisma.user.update({
                where: { id },
                data: { isActive: false },
                include: {
                    userRoles: {
                        select: {
                            role: { select: { name: true } }
                        }
                    }
                }
            });
            return UsersMapper.toGetUser(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async softDelete(id: string): Promise<GetUser> {
        try {
            const user = await this.prisma.user.update({
                where: { id },
                data: { isActive: false },
                include: {
                    userRoles: {
                        select: {
                            role: { select: { name: true } }
                        }
                    }
                }
            });
            return UsersMapper.toGetUser(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
