import { PrismaClient } from '@prisma/client';
import { Argon2HashProvider } from '../src/shared/infrastructure/argon2-hash.provider';

const prisma = new PrismaClient();
const hashProvider = new Argon2HashProvider();

async function main() {

    const usuarioAdmin = await prisma.user.findFirst({
        where: { email: 'kevin01306@gmail.com' },
        include: {
            userRoles: {
                select: {
                    role: {
                        select: {
                            name: true,
                            rolePermissions: {
                                select: {
                                    permission: { select: { action: true } }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!usuarioAdmin) {
        const passwordHash = await hashProvider.hash("12345678");
        await prisma.user.create({
            data: {
                email: 'kevin01306@gmail.com',
                passwordHash,
                firstName: "Administrador",
                lastName: "Sistema",
                isActive: true,
                userRoles: {
                    create: {
                        role: {
                            connectOrCreate: {
                                where: { name: "SUPER_ADMIN" },
                                create: {
                                    name: "SUPER_ADMIN",
                                    description: "Administrador del sistema",
                                    isSystem: true,
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    // Ensure standard roles exist
    await prisma.role.upsert({
        where: { name: "ADMIN" },
        update: {},
        create: {
            name: "ADMIN",
            description: "Administrator with general management permissions",
            isSystem: false,
        }
    });

    await prisma.role.upsert({
        where: { name: "USER" },
        update: {},
        create: {
            name: "USER",
            description: "Standard user account",
            isSystem: false,
        }
    });

    // Ensure permissions exist
    const permissions = [
        { action: 'users:create', description: 'Create users' },
        { action: 'users:read', description: 'Read users' },
        { action: 'users:update', description: 'Update users' },
        { action: 'users:delete', description: 'Delete users' },
        { action: 'brands:create', description: 'Create brands' },
        { action: 'brands:read', description: 'Read brands' },
        { action: 'brands:update', description: 'Update brands' },
        { action: 'brands:delete', description: 'Delete brands' },
        { action: 'folders:create', description: 'Create folders' },
        { action: 'folders:read', description: 'Read folders' },
        { action: 'folders:update', description: 'Update folders' },
        { action: 'folders:delete', description: 'Delete folders' },
        { action: 'assets:create', description: 'Create assets' },
        { action: 'assets:read', description: 'Read assets' },
        { action: 'assets:update', description: 'Update assets' },
        { action: 'assets:delete', description: 'Delete assets' },
        { action: 'audit:read', description: 'Read audit logs' },
        { action: 'roles:create', description: 'Create roles' },
        { action: 'roles:read', description: 'Read roles' },
        { action: 'roles:update', description: 'Update roles' },
        { action: 'roles:delete', description: 'Delete roles' },
        { action: 'roles:permissions:update', description: 'Assign permissions to roles' },
    ];


    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { action: perm.action },
            update: {},
            create: perm
        });
    }

    // Connect all permissions to SUPER_ADMIN role
    const superAdminRole = await prisma.role.findUnique({
        where: { name: "SUPER_ADMIN" }
    });

    if (superAdminRole) {
        const allPermissions = await prisma.permission.findMany();
        for (const p of allPermissions) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: superAdminRole.id,
                        permissionId: p.id
                    }
                },
                update: {},
                create: {
                    roleId: superAdminRole.id,
                    permissionId: p.id
                }
            });
        }
    }

    console.log("✅ Permisos y roles actualizados exitosamente");
    console.log("¡Seed ejecutado con éxito!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Error durante la ejecución del seed:", e); // IMPRESCINDIBLE para ver qué falla
        await prisma.$disconnect();
        //process.exit(1);
    });