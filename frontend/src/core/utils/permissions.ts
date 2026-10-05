import type { AuthUser } from '../../modules/auth/domain/interfaces/auth.interfaces';

/**
 * Normalizes a permission string to check both canonical ('module:action')
 * and inverted ('action:module') forms if applicable.
 */
const getPermissionVariants = (permission: string): string[] => {
    if (!permission) return [];
    if (!permission.includes(':')) return [permission];

    const [part1, part2] = permission.split(':');
    return [permission, `${part2}:${part1}`];
};

/**
 * Helper to extract user permissions and check for SUPER_ADMIN role bypass.
 */
const extractUserPermissions = (
    userOrPermissions: AuthUser | string[] | null | undefined
): { isSuperAdmin: boolean; permissions: string[] } => {
    if (!userOrPermissions) {
        return { isSuperAdmin: false, permissions: [] };
    }

    // When an AuthUser object is provided
    if (typeof userOrPermissions === 'object' && !Array.isArray(userOrPermissions)) {
        const user = userOrPermissions as AuthUser;
        const isSuperAdmin =
            user.role === 'SUPER_ADMIN' ||
            Boolean(user.roles && user.roles.includes('SUPER_ADMIN'));

        return {
            isSuperAdmin,
            permissions: Array.isArray(user.permissions) ? user.permissions : [],
        };
    }

    // When an array of permission strings is provided directly
    if (Array.isArray(userOrPermissions)) {
        return {
            isSuperAdmin: false,
            permissions: userOrPermissions,
        };
    }

    return { isSuperAdmin: false, permissions: [] };
};

/**
 * Checks if the user has a specific required permission.
 *
 * @param userOrPermissions - The AuthUser object or an array of user permissions.
 * @param requiredPermission - The permission string to verify (e.g., 'users:create').
 * @returns true if the user possesses the permission or is a SUPER_ADMIN.
 */
export const hasPermission = (
    userOrPermissions: AuthUser | string[] | null | undefined,
    requiredPermission: string
): boolean => {
    if (!requiredPermission) return true;

    const { isSuperAdmin, permissions } = extractUserPermissions(userOrPermissions);
    if (isSuperAdmin) return true;
    if (permissions.length === 0) return false;

    const variants = getPermissionVariants(requiredPermission);
    return variants.some((v) => permissions.includes(v));
};

/**
 * Checks if the user has AT LEAST ONE of the required permissions (logical OR / checkPermissionSome).
 *
 * @param userOrPermissions - The AuthUser object or an array of user permissions.
 * @param requiredPermissions - Array of permissions where at least one must match.
 * @returns true if the user has any of the listed permissions or is a SUPER_ADMIN.
 */
export const hasSomePermission = (
    userOrPermissions: AuthUser | string[] | null | undefined,
    requiredPermissions: string[]
): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const { isSuperAdmin, permissions } = extractUserPermissions(userOrPermissions);
    if (isSuperAdmin) return true;
    if (permissions.length === 0) return false;

    return requiredPermissions.some((requiredPerm) => {
        const variants = getPermissionVariants(requiredPerm);
        return variants.some((v) => permissions.includes(v));
    });
};

/**
 * Checks if the user has ALL of the specified permissions (logical AND).
 *
 * @param userOrPermissions - The AuthUser object or an array of user permissions.
 * @param requiredPermissions - Array of permissions that must all match.
 * @returns true if the user has every listed permission or is a SUPER_ADMIN.
 */
export const hasEveryPermission = (
    userOrPermissions: AuthUser | string[] | null | undefined,
    requiredPermissions: string[]
): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const { isSuperAdmin, permissions } = extractUserPermissions(userOrPermissions);
    if (isSuperAdmin) return true;
    if (permissions.length === 0) return false;

    return requiredPermissions.every((requiredPerm) => {
        const variants = getPermissionVariants(requiredPerm);
        return variants.some((v) => permissions.includes(v));
    });
};
