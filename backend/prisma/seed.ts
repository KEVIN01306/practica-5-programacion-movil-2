import { PrismaClient } from '@prisma/client';
import { Argon2HashProvider } from '../src/shared/infrastructure/argon2-hash.provider.js';

const prisma = new PrismaClient();
const hashProvider = new Argon2HashProvider();

async function main() {
    console.log("🌱 Iniciando seed de base de datos...");

    const usuarioAdmin = await prisma.user.findFirst({
        where: { email: 'kevin@cadimportinc.com' },
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
                email: 'kevin@cadimportinc.com',
                passwordHash,
                firstName: "Administrador",
                lastName: "Sistema",
                isActive: true,
                isVerify: true,
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
        console.log("✅ Usuario SUPER_ADMIN creado exitosamente.");
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

    // Define valid system permissions for the new schema and domain
    const validPermissions = [
        // Users
        { action: 'users:create', description: 'Create users' },
        { action: 'users:read', description: 'Read users' },
        { action: 'users:update', description: 'Update users' },
        { action: 'users:delete', description: 'Delete users' },
        // Roles & Permissions
        { action: 'roles:create', description: 'Create roles' },
        { action: 'roles:read', description: 'Read roles' },
        { action: 'roles:update', description: 'Update roles' },
        { action: 'roles:delete', description: 'Delete roles' },
        { action: 'roles:permissions:update', description: 'Assign permissions to roles' },
        // Audit
        { action: 'audit:read', description: 'Read audit logs' },
        // Websites (New domain)
        { action: 'websites:create', description: 'Create websites' },
        { action: 'websites:read', description: 'Read websites' },
        { action: 'websites:update', description: 'Update websites' },
        { action: 'websites:delete', description: 'Delete websites' },
        // Content Types (Headless CMS)
        { action: 'content-types:create', description: 'Create content types' },
        { action: 'content-types:read', description: 'Read content types' },
        { action: 'content-types:update', description: 'Update content types' },
        { action: 'content-types:delete', description: 'Delete content types' },
        // Content Fields (Headless CMS)
        { action: 'content-fields:create', description: 'Create content fields' },
        { action: 'content-fields:read', description: 'Read content fields' },
        { action: 'content-fields:update', description: 'Update content fields' },
        { action: 'content-fields:delete', description: 'Delete content fields' },
        // Content Items (Headless CMS)
        { action: 'content-items:create', description: 'Create content items' },
        { action: 'content-items:read', description: 'Read content items' },
        { action: 'content-items:update', description: 'Update content items' },
        { action: 'content-items:delete', description: 'Delete content items' },
        // Email Templates
        { action: 'email-templates:create', description: 'Create email templates' },
        { action: 'email-templates:read', description: 'Read email templates' },
        { action: 'email-templates:update', description: 'Update email templates' },
        { action: 'email-templates:delete', description: 'Delete email templates' },
        // Forms
        { action: 'forms:create', description: 'Create forms' },
        { action: 'forms:read', description: 'Read forms' },
        { action: 'forms:update', description: 'Update forms' },
        { action: 'forms:delete', description: 'Delete forms' },
        // Form Fields
        { action: 'form-fields:create', description: 'Create form fields' },
        { action: 'form-fields:read', description: 'Read form fields' },
        { action: 'form-fields:update', description: 'Update form fields' },
        { action: 'form-fields:delete', description: 'Delete form fields' },
        // Form Submissions
        { action: 'form-submissions:read', description: 'Read form submissions' },
        { action: 'form-submissions:update', description: 'Update form submissions status' },
        { action: 'form-submissions:delete', description: 'Delete form submissions' },
        // Contacts
        { action: 'contacts:create', description: 'Create contacts' },
        { action: 'contacts:read', description: 'Read contacts' },
        { action: 'contacts:update', description: 'Update contacts' },
        { action: 'contacts:delete', description: 'Delete contacts' },
        // Emails
        { action: 'emails:send', description: 'Dispatch customized emails via email provider' },
    ];

    // Clean up legacy permissions from database if they exist
    const legacyActions = [
        'brands:create', 'brands:read', 'brands:update', 'brands:delete',
        'folders:create', 'folders:read', 'folders:update', 'folders:delete',
        'assets:create', 'assets:read', 'assets:update', 'assets:delete',
    ];
    await prisma.permission.deleteMany({
        where: { action: { in: legacyActions } }
    });

    for (const perm of validPermissions) {
        await prisma.permission.upsert({
            where: { action: perm.action },
            update: { description: perm.description },
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
        console.error("❌ Error durante la ejecución del seed:", e);

    });