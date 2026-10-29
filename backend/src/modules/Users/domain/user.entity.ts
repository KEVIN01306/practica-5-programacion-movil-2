import type { Role } from "@prisma/client";

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: Role;
    roles?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUser extends Omit<User, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'roles' | 'role'> {
    role?: Role;
    roles?: string[];
}

export interface UpdateUser extends Partial<Omit<User, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'roles' | 'role'>> {
    role?: Role;
    roles?: string[];
}

export interface GetUser extends Omit<User, 'passwordHash'> {
    role: Role;
    roles: string[];
    emailSent?: boolean;
    generatedPassword?: string;
}

export interface GetSimpleUser extends Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'role' | 'isActive'> {
    roles: string[];
}
