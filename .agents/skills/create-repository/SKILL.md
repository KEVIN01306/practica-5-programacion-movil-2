---
name: create-repository
description: Creates or updates Domain Repository interfaces, Prisma Repository implementations, and Entity Mappers in backend.
---

# Skill: Create Repository (`create-repository`)

## What It Does
Guides the creation of data access layers in **Backend** (Domain contract + Prisma implementation + Mapper). Ensures soft-deletion (`isActive: true`), pagination, and proper error mapping via `PrismaErrorMapper`.

## Locations & Naming Conventions
- **Backend Domain Interface**: `backend/src/modules/<modulo>/domain/<entidad>.repository.ts`
- **Backend Prisma Implementation**: `backend/src/modules/<modulo>/infrastructure/prisma-<entidad>.repository.ts`
- **Backend Mapper**: `backend/src/modules/<modulo>/infrastructure/mappers/<entidad>.mapper.ts`

## Restrictions & Rules

### Backend Restrictions
1. **Contract First**: Always define or update the interface in `domain/<entidad>.repository.ts` before creating or modifying `infrastructure/prisma-<entidad>.repository.ts`.
2. **Soft Deletes**:
   - Entities with soft-delete support (`Product`, `User`) must filter by `isActive: true` where applicable.
   - Deletions should prefer soft delete (`isActive: false`) or standard deletes according to business rules.
3. **Error Mapping**: Wrap Prisma queries in `try / catch` and map errors via `PrismaErrorMapper.map(error)`.
4. **Domain Mappers**: Never leak raw Prisma model types outside `infrastructure/`. Always map Prisma records to Domain Entities.
5. **ESM `.js` Imports**: All local and alias imports in `backend/` must end in `.js`.

---

## Implementation Example: Backend Repository

### 1. Domain Contract (`domain/<entidad>.repository.ts`)
```typescript
import type { Categoria, CrearCategoria, ActualizarCategoria } from "./categoria.entity.js";

export interface CategoriasRepository {
    create(data: CrearCategoria): Promise<Categoria>;
    update(id: string, data: ActualizarCategoria): Promise<Categoria>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Categoria | null>;
    findAll(): Promise<Categoria[]>;
}
```

### 2. Prisma Implementation (`infrastructure/prisma-<entidad>.repository.ts`)
```typescript
import type { PrismaClient } from "@prisma/client";
import type { CategoriasRepository } from "../domain/categorias.repository.js";
import type { Categoria, CrearCategoria, ActualizarCategoria } from "../domain/categoria.entity.js";
import { PrismaErrorMapper } from "@shared/db/database/prisma/PrismaErrorMapper.js";
import { CategoriasMapper } from "./mappers/categorias.mapper.js";

export class PrismaCategoriasRepository implements CategoriasRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findById(id: string): Promise<Categoria | null> {
        try {
            const item = await this.prisma.category.findUnique({ where: { id } });
            return item ? CategoriasMapper.toDomain(item) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async findAll(): Promise<Categoria[]> {
        try {
            const list = await this.prisma.category.findMany({ orderBy: { name: "asc" } });
            return list.map(CategoriasMapper.toDomain);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async create(data: CrearCategoria): Promise<Categoria> {
        try {
            const item = await this.prisma.category.create({ data });
            return CategoriasMapper.toDomain(item);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async update(id: string, data: ActualizarCategoria): Promise<Categoria> {
        try {
            const item = await this.prisma.category.update({ where: { id }, data });
            return CategoriasMapper.toDomain(item);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.category.delete({ where: { id } });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
```
