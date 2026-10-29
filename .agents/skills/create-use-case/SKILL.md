---
name: create-use-case
description: Creates or updates an Application Use Case in backend following Clean Architecture conventions, repository dependency injection, and standardized AppError handling.
---

# Skill: Create Use Case (`create-use-case`)

## What It Does
Defines how to create or modify application use cases inside `backend/src/modules/<modulo>/application/<accion>-<entidad>.usecase.ts`. Use cases orchestrate business rules, validate domain invariants, invoke repository contracts or domain services, and translate persistence errors into standardized HTTP/application errors (`AppError`).

## Location & Naming Convention
- **Directory**: `backend/src/modules/<modulo>/application/`
- **File Name**: `<action>-<entity>.usecase.ts`
- **Class Name**: `<ActionPascalCase>UseCase` (e.g., `CreateCategoryUseCase`, `RegisterStockMovementUseCase`)

## Restrictions & Rules
1. **No Direct Prisma/Express Imports**: A Use Case MUST NEVER import `@prisma/client`, `prisma`, or Express `Request`/`Response`. It only depends on interfaces/types from `../domain/` and `@shared/`.
2. **ESM `.js` Extension**: All relative and path-alias imports in `backend` MUST end with `.js` (e.g., `import AppError from "@shared/errors/AppError.js";`).
3. **Single Public Method**: Expose a single `async execute(...)` method.
4. **Standard Error Mapping**:
   - Throw `new AppError(mensaje, codigo, statusCode)` for business rule violations:
     - `400` -> `'INVALID_DATA'` or `'BAD_REQUEST'`
     - `404` -> `'NOT_FOUND'`
     - `409` -> `'ALREADY_EXISTS'`
     - `500` -> `'DATABASE_ERROR'`
   - Catch persistence errors from `@shared/db/database/errors/` and rethrow as `AppError`.
5. **Atomic Mutations**: For operations modifying multiple records atomically (like stock movements modifying product currentStock and creating movement history), use Prisma transactions or inject `TransactionManager`.
