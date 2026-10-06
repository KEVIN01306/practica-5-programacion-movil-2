export class AuthMapper {
    static toDomain(user) {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            passwordHash: user.passwordHash,
            isActive: user.isActive,
            isVerify: Boolean(user.isVerify),
            roles: user.userRoles?.map((ur) => ur.role?.name || ur.role).filter(Boolean) || [],
            permissions: user.userRoles?.flatMap((ur) => ur.role?.rolePermissions?.map((rp) => rp.permission?.action) || []).filter(Boolean) || [],
            createdAt: user.createdAt,
        };
    }
}
//# sourceMappingURL=auth.mapper.js.map