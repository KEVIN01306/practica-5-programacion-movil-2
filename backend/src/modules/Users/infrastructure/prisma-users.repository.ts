import { type PrismaClient, Role } from "@prisma/client";
import type { UsersRepository } from "../domain/users.repository.js";
import type { User, CreateUser, UpdateUser, GetUser, GetSimpleUser } from "../domain/user.entity.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import { UsersMapper } from "./mappers/users.mapper.js";

export class PrismaUsersRepository implements UsersRepository {
    constructor(private readonly prisma: PrismaClient) { }

    private resolveRole(roleInput?: string | Role, rolesInput?: string[]): Role {
        if (roleInput && Object.values(Role).includes(roleInput as Role)) {
            return roleInput as Role;
        }
        if (rolesInput && rolesInput.length > 0) {
            const match = rolesInput.find(r => Object.values(Role).includes(r as Role));
            if (match) return match as Role;
        }
        return Role.OPERATOR;
    }

    async create(data: CreateUser): Promise<GetUser> {
        try {
            const role = this.resolveRole(data.role, data.roles);
            const user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    passwordHash: data.passwordHash,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role,
                    isActive: true
                }
            });
            return UsersMapper.toGetUser(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: UpdateUser): Promise<GetUser> {
        try {
            const updateData: any = {};
            if (data.email !== undefined) updateData.email = data.email;
            if (data.firstName !== undefined) updateData.firstName = data.firstName;
            if (data.lastName !== undefined) updateData.lastName = data.lastName;
            if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
            if (data.role !== undefined || data.roles !== undefined) {
                updateData.role = this.resolveRole(data.role, data.roles);
            }

            const user = await this.prisma.user.update({
                where: { id },
                data: updateData
            });
            return UsersMapper.toGetUser(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findById(id: string): Promise<GetUser | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id }
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
                    { email: { contains: query, mode: 'insensitive' } },
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } }
                ];
            }

            const [users, total] = await Promise.all([
                this.prisma.user.findMany({
                    where: whereClause,
                    skip: offset,
                    take: limit,
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
        return [
            { id: Role.ADMIN, name: Role.ADMIN, description: "Administrador con control total del sistema e inventario" },
            { id: Role.OPERATOR, name: Role.OPERATOR, description: "Operador de inventario (entradas, salidas y ajustes de stock)" }
        ];
    }

    async activate(id: string): Promise<GetUser> {
        try {
            const user = await this.prisma.user.update({
                where: { id },
                data: { isActive: true }
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

    async updateVerification(_id: string, _isVerify: boolean): Promise<void> {
        // No-op: isVerify column removed from schema
    }

    async disable(id: string): Promise<GetUser> {
        try {
            const user = await this.prisma.user.update({
                where: { id },
                data: { isActive: false }
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
                data: { isActive: false }
            });
            return UsersMapper.toGetUser(user);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
