import { PrismaAssetsRepository } from "./infrastructure/prisma-assets.repository.js";
import { CloudflareR2Provider } from "../../shared/infrastructure/cloudflare-r2.provider.js";
import { CreateAssetUseCase } from "./application/create-asset.usecase.js";
import { ListAssetsUseCase } from "./application/list-assets.usecase.js";
import { GetAssetUseCase } from "./application/get-asset.usecase.js";
import { UpdateAssetUseCase } from "./application/update-asset.usecase.js";
import { DeleteAssetUseCase } from "./application/delete-asset.usecase.js";
import { CopyAssetUseCase } from "./application/copy-asset.usecase.js";
import { AssetsController } from "./presentation/assets.controller.js";
export declare const storageProvider: CloudflareR2Provider;
export declare const assetsRepository: PrismaAssetsRepository;
export declare const createAssetUseCase: CreateAssetUseCase;
export declare const listAssetsUseCase: ListAssetsUseCase;
export declare const getAssetUseCase: GetAssetUseCase;
export declare const updateAssetUseCase: UpdateAssetUseCase;
export declare const copyAssetUseCase: CopyAssetUseCase;
export declare const deleteAssetUseCase: DeleteAssetUseCase;
export declare const assetsController: AssetsController;
//# sourceMappingURL=assets.module.d.ts.map