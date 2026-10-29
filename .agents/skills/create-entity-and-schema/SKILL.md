---
name: create-entity-and-schema
description: Creates or updates Domain Entities, DTO interfaces, and Zod validation schemas in backend.
---

# Skill: Create Entity and Schema (`create-entity-and-schema`)

## What It Does
Defines domain entities (`*.entity.ts`) and request validation schemas (`*.schema.ts`) using **Zod** so that data contracts remain strictly typed and validated across the application.

## Locations & Naming Conventions
- **Backend Entity**: `backend/src/modules/<modulo>/domain/<entidad>.entity.ts`
- **Backend Request Validator Schema**: `backend/src/modules/<modulo>/presentation/validators/<entidad>.schema.ts`

## Restrictions & Rules
1. **Pure Domain Entities**: `domain/<entidad>.entity.ts` must only contain TypeScript `interface` or `type` declarations (and pure domain value logic if needed). Never import Prisma or Express types here.
2. **Standard Entity Variants**:
   - `<Entidad>`: Full domain representation (includes `id`, `createdAt`, `updatedAt`, etc.).
   - `Crear<Entidad>`: DTO for creation (omits generated fields like `id`, `createdAt`).
   - `Actualizar<Entidad>`: DTO for updates.
3. **Zod Validation**:
   - Trim strings (`.trim()`) and provide clear error messages.
   - Validate UUIDs with `.uuid('Mensaje claro')`.
   - For update schemas, use `.partial()` on the creation schema or define explicit optional fields.
