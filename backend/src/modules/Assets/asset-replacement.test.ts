import assert from 'node:assert/strict';
import { PrismaClient, AssetType } from '@prisma/client';
import { CreateAssetUseCase } from './application/create-asset.usecase.js';
import { UpdateAssetUseCase } from './application/update-asset.usecase.js';
import { PrismaAssetsRepository } from './infrastructure/prisma-assets.repository.js';
import { PrismaBrandsRepository } from '../Brands/infrastructure/prisma-brands.repository.js';
import { PrismaFoldersRepository } from '../Folders/infrastructure/prisma-folders.repository.js';
import { AuditLogService } from '../Audit/application/audit-log.service.js';
import { PrismaAuditRepository } from '../Audit/infrastructure/prisma-audit.repository.js';
import type { StorageProvider, UploadFileParams, UploadFileResult } from '../../shared/domain/storage.provider.js';

class MockStorageProvider implements StorageProvider {
    public storageMap = new Map<string, { buffer: Buffer; mimeType: string }>();
    public publicUrl = "https://cdn.example.com/assets";

    getUrl(key: string): string {
        const clean = key.replace(/^\/+/, "");
        return `${this.publicUrl}/${clean}`;
    }

    extractKeyFromUrl(url: string): string {
        if (!url) return "";
        if (url.startsWith(this.publicUrl)) {
            return url.slice(this.publicUrl.length).replace(/^\/+/, "");
        }
        try {
            const parsed = new URL(url);
            return parsed.pathname.replace(/^\/+/, "");
        } catch {
            return url.replace(/^\/+/, "");
        }
    }

    async upload(params: UploadFileParams): Promise<UploadFileResult> {
        const cleanKey = params.key.replace(/^\/+/, "");
        this.storageMap.set(cleanKey, {
            buffer: params.buffer,
            mimeType: params.mimeType,
        });
        return {
            key: cleanKey,
            url: this.getUrl(cleanKey),
        };
    }

    async replace(params: UploadFileParams): Promise<UploadFileResult> {
        return this.upload(params);
    }

    async copy(sourceKey: string, destinationKey: string): Promise<UploadFileResult> {
        const cleanSource = sourceKey.replace(/^\/+/, "");
        const cleanDest = destinationKey.replace(/^\/+/, "");
        const item = this.storageMap.get(cleanSource);
        if (item) {
            this.storageMap.set(cleanDest, { ...item });
        }
        return {
            key: cleanDest,
            url: this.getUrl(cleanDest),
        };
    }

    async move(sourceKey: string, destinationKey: string): Promise<UploadFileResult> {
        const res = await this.copy(sourceKey, destinationKey);
        await this.delete(sourceKey);
        return res;
    }

    async delete(key: string): Promise<void> {
        const cleanKey = key.replace(/^\/+/, "");
        this.storageMap.delete(cleanKey);
    }

    async deleteMany(keys: string[]): Promise<void> {
        for (const k of keys) {
            await this.delete(k);
        }
    }
}

async function runTests() {
    console.log('🧪 Starting Asset File Replacement & URL Stability Automated Test Suite...\n');

    const prisma = new PrismaClient();
    const assetsRepository = new PrismaAssetsRepository(prisma);
    const brandsRepository = new PrismaBrandsRepository(prisma);
    const foldersRepository = new PrismaFoldersRepository(prisma);
    const auditRepository = new PrismaAuditRepository(prisma);
    const auditLogService = new AuditLogService(auditRepository);
    const mockStorage = new MockStorageProvider();

    const createAssetUseCase = new CreateAssetUseCase(
        assetsRepository,
        brandsRepository,
        foldersRepository,
        mockStorage,
        auditLogService
    );

    const updateAssetUseCase = new UpdateAssetUseCase(
        assetsRepository,
        brandsRepository,
        foldersRepository,
        mockStorage,
        auditLogService
    );

    // Setup: Create a temporary test brand
    const testBrand = await prisma.brand.create({
        data: {
            name: `Test Brand ${Date.now()}`,
            description: "Temporary Brand for Image Replacement Tests",
        },
    });

    try {
        console.log(`✅ [Setup] Created test brand: ${testBrand.name} (${testBrand.id})`);

        // =========================================================================
        // Test 1: Upload new image (Case 4 - Standard Upload)
        // =========================================================================
        console.log('\n--- Test 1: Standard New Asset Upload ---');
        const initialBuffer = Buffer.from('ORIGINAL_IMAGE_CONTENT_PRODUCTO_JPG');
        const asset1 = await createAssetUseCase.execute({
            name: 'Producto Original',
            brandId: testBrand.id,
            file: {
                originalname: 'producto.jpg',
                mimetype: 'image/jpeg',
                size: initialBuffer.length,
                buffer: initialBuffer,
            },
        });

        assert.ok(asset1.id, 'Asset 1 must be created');
        assert.equal(asset1.fileName, 'producto.jpg');
        assert.ok(asset1.url.includes('producto.jpg') || asset1.url.includes('Producto_Original'));
        const originalUrl1 = asset1.url;
        const originalKey1 = mockStorage.extractKeyFromUrl(originalUrl1);
        assert.equal(mockStorage.storageMap.get(originalKey1)?.buffer.toString(), 'ORIGINAL_IMAGE_CONTENT_PRODUCTO_JPG');
        console.log(`✅ [Case 4] New upload created successfully with URL: ${originalUrl1}`);

        // =========================================================================
        // Test 2: Replace with same file name (Case 1)
        // =========================================================================
        console.log('\n--- Test 2: Replace with SAME file name (producto.jpg) ---');
        const replacedBufferSameName = Buffer.from('NEW_CONTENT_SAME_NAME');
        const replacedAsset1 = await updateAssetUseCase.execute(asset1.id, {
            file: {
                originalname: 'producto.jpg',
                mimetype: 'image/jpeg',
                size: replacedBufferSameName.length,
                buffer: replacedBufferSameName,
            },
        });

        assert.equal(replacedAsset1.id, asset1.id);
        assert.equal(replacedAsset1.url, originalUrl1, 'URL must remain EXACTLY the same');
        assert.equal(replacedAsset1.fileName, 'producto.jpg', 'fileName must remain unchanged');
        assert.equal(mockStorage.storageMap.get(originalKey1)?.buffer.toString(), 'NEW_CONTENT_SAME_NAME', 'Storage content must be updated');
        console.log(`✅ [Case 1] Replaced with same name: URL strictly preserved (${replacedAsset1.url})`);

        // =========================================================================
        // Test 3: Replace with DIFFERENT file name (Case 2 - producto.jpg -> nueva-imagen.jpg)
        // =========================================================================
        console.log('\n--- Test 3: Replace with DIFFERENT file name (nueva-imagen.jpg) ---');
        const replacedBufferDiffName = Buffer.from('NEW_CONTENT_DIFFERENT_NAME');
        const replacedAsset2 = await updateAssetUseCase.execute(asset1.id, {
            file: {
                originalname: 'nueva-imagen.jpg',
                mimetype: 'image/jpeg',
                size: replacedBufferDiffName.length,
                buffer: replacedBufferDiffName,
            },
        });

        assert.equal(replacedAsset2.id, asset1.id);
        assert.equal(replacedAsset2.url, originalUrl1, 'URL must remain EXACTLY the same even when uploaded file has different name');
        assert.equal(replacedAsset2.fileName, 'producto.jpg', 'Original fileName must be preserved');
        assert.equal(mockStorage.storageMap.get(originalKey1)?.buffer.toString(), 'NEW_CONTENT_DIFFERENT_NAME', 'Storage content must be updated');
        console.log(`✅ [Case 2] Replaced with different name: URL strictly preserved (${replacedAsset2.url})`);

        // =========================================================================
        // Test 4: Replace with COMPLETELY DIFFERENT file name & extension (Case 3 - banner-home.webp -> foto-verano-final-2026.png)
        // =========================================================================
        console.log('\n--- Test 4: Replace banner-home.webp with foto-verano-final-2026.png ---');
        const webpBuffer = Buffer.from('ORIGINAL_WEBP_CONTENT');
        const asset2 = await createAssetUseCase.execute({
            name: 'Banner Home',
            brandId: testBrand.id,
            file: {
                originalname: 'banner-home.webp',
                mimetype: 'image/webp',
                size: webpBuffer.length,
                buffer: webpBuffer,
            },
        });

        const originalUrl2 = asset2.url;
        const originalKey2 = mockStorage.extractKeyFromUrl(originalUrl2);

        const pngBuffer = Buffer.from('NEW_PNG_CONTENT_VERANO');
        const replacedAsset3 = await updateAssetUseCase.execute(asset2.id, {
            file: {
                originalname: 'foto-verano-final-2026.png',
                mimetype: 'image/png',
                size: pngBuffer.length,
                buffer: pngBuffer,
            },
        });

        assert.equal(replacedAsset3.id, asset2.id);
        assert.equal(replacedAsset3.url, originalUrl2, 'URL must remain EXACTLY the original banner URL');
        assert.equal(replacedAsset3.fileName, 'banner-home.webp', 'Original fileName must be preserved');
        assert.equal(replacedAsset3.extension, 'webp', 'Original extension must be preserved');
        assert.equal(replacedAsset3.mimeType, 'image/png', 'mimeType reflects new file');
        assert.equal(Number(replacedAsset3.sizeBytes), pngBuffer.length, 'sizeBytes reflects new file');
        assert.equal(mockStorage.storageMap.get(originalKey2)?.buffer.toString(), 'NEW_PNG_CONTENT_VERANO', 'Storage content at original key must be updated');
        console.log(`✅ [Case 3] Replaced with completely different name & ext: URL strictly preserved (${replacedAsset3.url})`);

        console.log('\n🎉 ALL 4 IMAGE REPLACEMENT TEST CASES PASSED SUCCESSFULLY!');

    } finally {
        // Cleanup test data
        await prisma.asset.deleteMany({ where: { brandId: testBrand.id } });
        await prisma.brand.delete({ where: { id: testBrand.id } });
        await prisma.$disconnect();
        console.log('🧹 Cleaned up temporary test brand and assets.');
    }
}

runTests().catch((err) => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
});
