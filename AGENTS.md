# AGENTS.md — Punto de Entrada e Índice Maestro de Orquestación

> **LECTURA OBLIGATORIA**: Cualquier modelo o agente de IA que interactúe con este repositorio **DEBE** leer este archivo antes de analizar, planificar o escribir código. Este documento actúa como el índice maestro que define qué agente ejecutar, qué skills aplicar, cuáles son las restricciones generales y cómo funciona el ciclo de desarrollo.

---

## 1. Reglas y Restricciones Generales (Inquebrantables)

1. **Prohibido Codear sin Consultar Contexto**:
   - Antes de empezar a tocar código, **DEBES** revisar:
     1. [`.agents/MEMORY.md`](./.agents/MEMORY.md) para conocer el estado actual del Backend, Frontend, Base de Datos, Herramientas y APIs.
     2. Los agentes disponibles en `.agents/agents/*/SKILL.md`.
     3. Las skills técnicas disponibles en `.agents/skills/*/SKILL.md`.
2. **Respeto Estricto a Clean Architecture**:
   - Tanto `backend` (Node.js/Express) como `frontend` (Flutter) siguen una arquitectura limpia y modular dividida en:
     - `domain`: Entidades, contratos de repositorios, enums y modelos de dominio puros (sin dependencias de infraestructura).
     - `application`: Casos de uso (`*.usecase.ts`) que orquestan lógica de negocio, mapean errores a `AppError` y coordinan con repositorios.
     - `infrastructure`: Implementaciones de persistencia con Prisma (`PrismaErrorMapper`, mappers de entidad), clientes HTTP (Dio en Flutter), proveedores externos.
     - `presentation`: Controladores Express, esquemas de validación Zod, rutas HTTP en Backend; pantallas, widgets y gestión de estado en Flutter.
   - Está prohibido saltar capas (por ejemplo, importar `@prisma/client` en un controlador o caso de uso).
3. **Control de Acceso basado en Roles (`Role`)**:
   - El sistema opera exclusivamente con **Roles** definidos en la base de datos (`ADMIN`, `OPERATOR`).
   - No se utiliza matriz de permisos granulares (`permissions`), únicamente validación de roles en endpoints protegidos.
4. **Manejo de Borrado Lógico (`isActive`)**:
   - Las entidades como `Product` y `User` manejan borrado lógico mediante `isActive: true` / `isActive: false`.
5. **ESM con Extensión `.js` en Backend**:
   - En `backend/`, todas las importaciones relativas o mediante path aliases (`@shared/*`, `@app/*`, `@infrastructure/*`, `@modules/*`) deben incluir la extensión `.js`.
6. **Separación de Responsabilidades (Nadie se auto-aprueba)**:
   - El `coder` nunca declara su propio trabajo como verificado. Todo cambio de código debe ser validado por el `tester` con salida real de comandos (`npx tsc --noEmit`, tests, linters).
7. **Actualización de Memoria**:
   - Al finalizar y verificar cualquier requerimiento, el `manager` debe actualizar [`.agents/MEMORY.md`](./.agents/MEMORY.md) reflejando los nuevos endpoints, modelos, módulos o cambios realizados.
8. **Funcionalidades Retiradas / No Activas**:
   - **Audit**: Retirado del sistema activo. No se generan logs de auditoría ni existen rutas de auditoría.
   - **Servicio OTP**: Retirado del flujo activo de autenticación. El código se mantiene archivado/inactivo sin exponer endpoints activos.

---

## 2. Estructura del Repositorio

- `backend/`: API REST en Node.js, Express, TypeScript y Prisma ORM con PostgreSQL.
- `frontend/`: Aplicación móvil/web en Flutter (Dart), estructurada bajo Clean Architecture (en migración activa).
- `frontend_/`: Frontend legado en React + Vite (en proceso de retiro progresivo).
- `.agents/`: Memoria del sistema, especificación de agentes (`manager`, `coder`, `tester`) y skills técnicas.

---

## 3. Índice de Agentes Disponibles (`.agents/agents/`)

| Agente | Archivo de Definición | Rol Principal | ¿Cuándo activarlo? |
| :--- | :--- | :--- | :--- |
| **Manager** | [`.agents/agents/manager/SKILL.md`](./.agents/agents/manager/SKILL.md) | Arquitecto y Orquestador. Analiza el prompt del usuario, revisa `MEMORY.md`, diseña el plan técnico, crea tareas estructuradas (`#Task-XX`), selecciona qué `skills` deben usarse, coordina a los `coder`, valida con el `tester` y actualiza `MEMORY.md`. | **Siempre como primer paso** ante cualquier requerimiento de nueva funcionalidad, refactorización, módulo nuevo o flujo multi-paso. |
| **Coder** | [`.agents/agents/coder/SKILL.md`](./.agents/agents/coder/SKILL.md) | Implementador / Investigador. Trabaja exactamente **una tarea estructurada a la vez** en modo `triage` (diagnóstico sin cambios) o `implement` (siguiendo las `skills`). Entrega evidencia con salida real de comandos. | Cuando el `manager` asigna un brief estructurado para diagnosticar o escribir código. |
| **Tester** | [`.agents/agents/tester/SKILL.md`](./.agents/agents/tester/SKILL.md) | Auditor de Calidad y QA. Verifica el trabajo del `coder` contra los criterios de aceptación del `manager`, audita el cumplimiento arquitectónico, ejecuta compilación TypeScript / linter / tests y emite veredicto (`VERIFIED` o `REWORK_REQUIRED`). | Inmediatamente después de que un `coder` termina de implementar o corregir una tarea. |

---

## 4. Índice de Skills Técnicas Disponibles (`.agents/skills/`)

| Skill | Archivo de Definición | Qué hace y cuándo usarla |
| :--- | :--- | :--- |
| **`create-entity-and-schema`** | [`.agents/skills/create-entity-and-schema/SKILL.md`](./.agents/skills/create-entity-and-schema/SKILL.md) | Creación/edición de entidades de dominio (`domain/*.entity.ts`), validadores Zod en backend (`presentation/validators/*.schema.ts`) y modelos en Flutter. |
| **`create-repository`** | [`.agents/skills/create-repository/SKILL.md`](./.agents/skills/create-repository/SKILL.md) | Creación/edición de contratos de repositorio (`domain/*.repository.ts`), implementaciones Prisma (`infrastructure/prisma-*.repository.ts`), mappers (`infrastructure/mappers/*.mapper.ts`) y repositorios Dio en Flutter. |
| **`create-use-case`** | [`.agents/skills/create-use-case/SKILL.md`](./.agents/skills/create-use-case/SKILL.md) | Creación/edición de casos de uso en `backend/src/modules/<modulo>/application/*.usecase.ts`, inyección de dependencias y mapeo de errores a `AppError`. |
| **`create-controller-and-routes`** | [`.agents/skills/create-controller-and-routes/SKILL.md`](./.agents/skills/create-controller-and-routes/SKILL.md) | Creación/edición de controladores (`BaseController`, `Respuesta.exito`), rutas Express (`AuthMiddleware.routeProtect`, `AuthMiddleware.checkRole`, `ValidarMiddleware`), inyección en `<modulo>.module.ts` y registro en `src/routes/index.routes.ts`. |
| **`create-frontend-module`** | [`.agents/skills/create-frontend-module/SKILL.md`](./.agents/skills/create-frontend-module/SKILL.md) | Creación/edición de módulos de Flutter en `frontend/lib/modules/<modulo>/` (Clean Architecture: domain, infrastructure, presentation con BLoC/Cubit o Provider). |

---

## 5. Ciclo de Ejecución y Orquestación

```mermaid
flowchart TD
    UserPrompt["1. Prompt del Usuario"] --> ReadIndex["2. Leer AGENTS.md y .agents/MEMORY.md"]
    ReadIndex --> ManagerPlan["3. Agente MANAGER: Analiza, crea Plan y Tareas (#Task-01...) e identifica Skills"]
    ManagerPlan --> SpawnCoder["4. Agente CODER: Lee las Skills asignadas y ejecuta la Tarea (triage o implement)"]
    SpawnCoder --> TesterVerify["5. Agente TESTER: Audita código, verifica criterios y ejecuta npx tsc / build / tests"]
    TesterVerify -->|REWORK_REQUIRED (Falló)| ReworkBrief["Tester envía reporte de errores al Coder"]
    ReworkBrief --> SpawnCoder
    TesterVerify -->|VERIFIED (Aprobado)| UpdateMemory["6. Agente MANAGER: Actualiza .agents/MEMORY.md y entrega reporte final al usuario"]
```
