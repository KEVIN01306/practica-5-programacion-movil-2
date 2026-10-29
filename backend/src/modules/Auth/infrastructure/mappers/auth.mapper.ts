import type { AuthUser } from "../../domain/auth-user.entity.js";

export class AuthMapper {
    static toDomain(user: any): AuthUser {
        const role = user.role || "OPERATOR";
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            passwordHash: user.passwordHash,
            isActive: user.isActive,
            role,
            roles: [role],
            createdAt: user.createdAt,
        };
    }
}
