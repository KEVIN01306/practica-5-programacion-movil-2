import type { FoldersRepository } from "../domain/folders.repository.js";
import type { AssetsRepository } from "../../Assets/domain/assets.repository.js";
import type { StorageProvider } from "../../../shared/domain/storage.provider.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
export declare class DeleteFolderUseCase {
    private readonly foldersRepository;
    private readonly assetsRepository;
    private readonly storageProvider;
    private readonly auditLogService;
    constructor(foldersRepository: FoldersRepository, assetsRepository: AssetsRepository, storageProvider: StorageProvider, auditLogService: AuditLogService);
    execute(id: string, context?: AuditContext): Promise<void>;
}
//# sourceMappingURL=delete-folder.usecase.d.ts.map