import type { User, GetUser, GetSimpleUser } from "../../domain/user.entity.js";

export class UsersMapper {
    static toDomain(user: any): User {
        return {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
            isVerify: Boolean(user.isVerify),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    static toGetUser(user: any): GetUser {
        const roles = user.userRoles?.map((ur: any) => ur.role?.name || ur.role).filter(Boolean) || [];
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
            isVerify: Boolean(user.isVerify),
            roles,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    static toGetSimpleUser(user: any): GetSimpleUser {
        const roles = user.userRoles?.map((ur: any) => ur.role?.name || ur.role).filter(Boolean) || [];
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
            isVerify: Boolean(user.isVerify),
            roles
        };
    }
}
