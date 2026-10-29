# CLAUDE.md — Guía Maestra de Contexto y Orquestación de Agentes

> **INSTRUCCIÓN CRÍTICA DE ENTRADA**: Antes de responder con código o modificar cualquier archivo en este repositorio, **DEBES** seguir las reglas, agentes, skills y flujo de trabajo definidos en este documento y en [`AGENTS.md`](./AGENTS.md).

---

## 1. Protocolo Obligatorio Antes de Codear

Cada vez que recibas un prompt del usuario:
1. **Revisa la Memoria del Repositorio**: Lee [`.agents/MEMORY.md`](./.agents/MEMORY.md) para conocer la arquitectura actual de `backend/`, `frontend/` (Flutter), el esquema PostgreSQL/Prisma (`backend/prisma/schema.prisma`), y el estado de los módulos.
2. **Identifica los Agentes en `.agents/agents/`**:
   - [`manager`](./.agents/agents/manager/SKILL.md): Analiza el requerimiento, elabora el plan, estructura las tareas (`#Task-01`, `#Task-02`, ...) y coordina a los `coder` y al `tester`.
   - [`coder`](./.agents/agents/coder/SKILL.md): Ejecuta una única tarea estructurada a la vez (`triage` o `implement`) siguiendo estrictamente las skills asignadas.
   - [`tester`](./.agents/agents/tester/SKILL.md): Audita y prueba de manera independiente los cambios del `coder`. Emite `VERIFIED` o `REWORK_REQUIRED` con evidencia de comandos.
3. **Consulta las Skills en `.agents/skills/`**:
   - [`create-entity-and-schema`](./.agents/skills/create-entity-and-schema/SKILL.md): Entidades de dominio (`*.entity.ts`), schemas Zod (`*.schema.ts`) y modelos Dart.
   - [`create-repository`](./.agents/skills/create-repository/SKILL.md): Contratos (`*.repository.ts`), implementaciones Prisma (`prisma-*.repository.ts`), mappers (`*.mapper.ts`) y repositorios de red.
   - [`create-use-case`](./.agents/skills/create-use-case/SKILL.md): Casos de uso en `application/*.usecase.ts` con manejo de `AppError`.
   - [`create-controller-and-routes`](./.agents/skills/create-controller-and-routes/SKILL.md): Controladores (`BaseController`, `Respuesta`), rutas Express (`AuthMiddleware`, `ValidarMiddleware`) e inyección de dependencias.
   - [`create-frontend-module`](./.agents/skills/create-frontend-module/SKILL.md): Módulos Flutter (Clean Architecture: `domain/`, `infrastructure/`, `presentation/`).

---

## 2. Ciclo de Implementación (`Manager` ➔ `Coder` ➔ `Tester` ➔ `Memory`)

1. **Fase 1 — Planificación (`manager`)**:
   - Desglosa el requerimiento en tareas atómicas (`#Task-ID`).
   - Especifica archivos objetivo, skills requeridas y criterios de aceptación.
2. **Fase 2 — Desarrollo (`coder`)**:
   - Implementa el código respetando Clean Architecture.
   - Realiza verificaciones locales y reporta comandos ejecutados.
3. **Fase 3 — Validación (`tester`)**:
   - Audita el código y ejecuta comandos reales (`npx tsc --noEmit` en backend, `flutter analyze` en frontend).
   - Aprueba (`VERIFIED`) o solicita corrección con diagnóstico detallado (`REWORK_REQUIRED`).
4. **Fase 4 — Actualización de Memoria (`manager`)**:
   - Registra los cambios y nuevos endpoints en [`.agents/MEMORY.md`](./.agents/MEMORY.md).

---

## 3. Comandos Rápidos de Verificación

- **Backend (`backend/`)**:
  - Verificar tipos / compilar: `cd backend && npx tsc --noEmit`
  - Build: `cd backend && npm run build`
  - Servidor de desarrollo: `cd backend && npm run dev`
  - Generar cliente Prisma: `cd backend && npx prisma generate`
  - Migraciones Prisma: `cd backend && npm run db:migrate`
  - Seed de datos: `cd backend && npm run db:seed`
- **Frontend Flutter (`frontend/`)**:
  - Análisis estático: `cd frontend && flutter analyze`
  - Dependencias: `cd frontend && flutter pub get`
  - Ejecutar en desarrollo: `cd frontend && flutter run`

---

## 4. Reglas del Dominio del Sistema de Inventario

- **Base de Datos**: PostgreSQL con Prisma. Modelos: `User`, `UserSession`, `Category`, `Product`, `StockMovement`.
- **Roles**: Enums `Role` (`ADMIN`, `OPERATOR`). No hay sistema de permisos individuales.
- **Borrado Lógico**: Productos (`isActive: true/false`) y Usuarios (`isActive: true/false`).
- **Movimientos de Stock**: `MovementType` (`ENTRY`, `EXIT`, `ADJUST`). Manejo atómico de inventario (actualiza `Product.currentStock` registrando el historial en `StockMovement`).
- **Sin Auditoría (Audit Desactivado)**: El módulo y tablas de auditoría están retirados.
- **Sin OTP Activo**: La funcionalidad de reseteo o verificación por OTP está retirada del flujo activo.
- **Imports ESM**: En `backend/` todos los imports locales o vía alias deben terminar con `.js`.
