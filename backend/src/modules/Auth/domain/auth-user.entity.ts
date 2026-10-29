import type { Role } from "@prisma/client";

export interface AuthUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    isActive: boolean;
    role: Role;
    roles: string[];
    createdAt?: Date;
}
