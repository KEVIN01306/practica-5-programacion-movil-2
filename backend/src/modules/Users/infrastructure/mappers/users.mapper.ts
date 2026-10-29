import type { User, GetUser, GetSimpleUser } from "../../domain/user.entity.js";

export class UsersMapper {
    static toDomain(user: any): User {
        const role = user.role || "OPERATOR";
        return {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            firstName: user.firstName,
            lastName: user.lastName,
            role,
            roles: [role],
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    static toGetUser(user: any): GetUser {
        const role = user.role || "OPERATOR";
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role,
            roles: [role],
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    static toGetSimpleUser(user: any): GetSimpleUser {
        const role = user.role || "OPERATOR";
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role,
            roles: [role],
            isActive: user.isActive
        };
    }
}
