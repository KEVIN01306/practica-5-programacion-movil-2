---
name: create-controller-and-routes
description: Creates or updates Express Controllers, Routes with Auth/Validation middlewares, and Module Dependency Injection wiring in backend.
---

# Skill: Create Controller and Routes (`create-controller-and-routes`)

## What It Does
Defines how to expose Use Cases over HTTP in `backend/` using `BaseController`, `ApiResponse` / standard response helper, `AuthMiddleware` (`routeProtect`, `checkRole`), `ValidatedMiddleware`, wire dependencies in `<modulo>.module.ts`, and register routes in `src/routes/index.routes.ts`.

## Locations & Naming Conventions
- **Controller**: `backend/src/modules/<modulo>/presentation/<entidad>.controller.ts`
- **Routes**: `backend/src/modules/<modulo>/presentation/<entidad>.routes.ts`
- **DI Module Wiring**: `backend/src/modules/<modulo>/<entidad>.module.ts`
- **Global Router**: `backend/src/routes/index.routes.ts`

## Restrictions & Rules
1. **Extend `BaseController`**:
   - Every controller extends `BaseController` (`src/presentation/base.controller.ts`).
2. **Arrow Function Handlers**:
   - Define controller methods as arrow functions (`getById = async (req: Request, res: Response, next: NextFunction) => { ... }`) to preserve `this`.
   - Always forward errors to `next(error)` inside `catch (error) { next(error); }`.
3. **Standard Responses**:
   - Return clean JSON responses with standard status codes (`200 OK`, `201 Created`, `204 No Content`).
4. **Route Security & Validation**:
   - Protect sensitive endpoints with `authMiddleware.routeProtect`.
   - Restrict administrative endpoints with `authMiddleware.checkRole(["ADMIN"])`.
   - Validate body and query params with `validatedMiddleware.validateBody(schema)` and `validatedMiddleware.validateQuery(schema)`.
