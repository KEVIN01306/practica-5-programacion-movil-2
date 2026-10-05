import type { User, CreateUser, UpdateUser, GetUser, GetSimpleUser } from "./user.entity.js";

export interface UsersRepository {
    create(data: CreateUser): Promise<GetUser>;
    update(id: string, data: UpdateUser): Promise<GetUser>;
    findById(id: string): Promise<GetUser | null>;
    findByIdWithPassword(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<GetSimpleUser[]>;
    findAllPaginated(page: number, limit: number, filters?: { q?: string }): Promise<{ data: GetSimpleUser[]; total: number }>;
    findAllRoles(): Promise<{ id: string; name: string; description: string | null }[]>;
    activate(id: string): Promise<GetUser>;
    disable(id: string): Promise<GetUser>;
    softDelete(id: string): Promise<GetUser>;
    updatePassword(id: string, passwordHash: string): Promise<void>;
}
