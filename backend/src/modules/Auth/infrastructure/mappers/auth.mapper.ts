import type { AuthUser } from "../../domain/auth-user.entity.js";

export class AuthMapper {
    static toDomain(user: any): AuthUser {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            passwordHash: user.passwordHash,
            isActive: user.isActive,
            isVerify: Boolean(user.isVerify),
            roles: user.userRoles?.map((ur: any) => ur.role?.name || ur.role).filter(Boolean) || [],
            permissions: user.userRoles?.flatMap((ur: any) => 
                ur.role?.rolePermissions?.map((rp: any) => rp.permission?.action) || []
            ).filter(Boolean) || [],
            createdAt: user.createdAt,
        };
    }
}