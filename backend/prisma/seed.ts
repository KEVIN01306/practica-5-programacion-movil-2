import { PrismaClient, Role } from '@prisma/client';
import { Argon2HashProvider } from '../src/shared/infrastructure/argon2-hash.provider.js';

const prisma = new PrismaClient();
const hashProvider = new Argon2HashProvider();

async function main() {
    console.log("🌱 Iniciando seed de base de datos...");

    // 1. Seed Admin User
    const existingAdmin = await prisma.user.findFirst({
        where: { email: 'admin@inventario.com' }
    });

    if (!existingAdmin) {
        const passwordHash = await hashProvider.hash("Admin1234*");
        await prisma.user.create({
            data: {
                email: 'admin@inventario.com',
                passwordHash,
                firstName: "Admin",
                lastName: "Sistema",
                role: Role.ADMIN,
                isActive: true
            }
        });
        console.log("✅ Usuario ADMIN creado: admin@inventario.com / Admin1234*");
    }

    // 2. Seed Operator User
    const existingOperator = await prisma.user.findFirst({
        where: { email: 'operador@inventario.com' }
    });

    if (!existingOperator) {
        const passwordHash = await hashProvider.hash("Operador1234*");
        await prisma.user.create({
            data: {
                email: 'operador@inventario.com',
                passwordHash,
                firstName: "Operador",
                lastName: "Bodega",
                role: Role.OPERATOR,
                isActive: true
            }
        });
        console.log("✅ Usuario OPERATOR creado: operador@inventario.com / Operador1234*");
    }

    // 3. Seed Default Category
    const generalCategory = await prisma.category.upsert({
        where: { name: 'General' },
        update: {},
        create: {
            name: 'General',
            description: 'Categoría por defecto para productos del inventario'
        }
    });
    console.log("✅ Categoría General creada o existente.");

    // 4. Seed Sample Product
    const sampleProduct = await prisma.product.upsert({
        where: { code: 'PROD-001' },
        update: {},
        create: {
            code: 'PROD-001',
            name: 'Producto de Demostración',
            description: 'Artículo para pruebas iniciales de inventario',
            costPrice: 10.50,
            salePrice: 15.00,
            currentStock: 100,
            minStock: 10,
            categoryId: generalCategory.id,
            isActive: true
        }
    });
    console.log("✅ Producto demo creado: PROD-001");

    console.log("🌱 Seed completado exitosamente.");
}

main()
    .catch((e) => {
        console.error("❌ Error en seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
