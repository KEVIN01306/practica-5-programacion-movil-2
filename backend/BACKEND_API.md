# Documentación de la API Backend (Web Admin System)

Esta documentación describe el estado real y definitivo del backend de la plataforma, construido siguiendo los principios de **Arquitectura Limpia (Clean Architecture)** y **Arquitectura Hexagonal (Puertos y Adaptadores)** con Node.js, Express, TypeScript y Prisma ORM.

---

## 1. Arquitectura del Sistema

El backend está organizado en módulos desacoplados bajo `src/modules/` y utilidades compartidas bajo `src/shared/` y `src/app/`. Cada módulo implementa 4 capas fundamentales:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Capas de la Arquitectura                │
├─────────────────┬───────────────────────────────────────────┤
│ Presentation    │ Rutas Express, Controladores y Zod Schemas│
│ Application     │ Casos de Uso (Use Cases) y Lógica Negocio │
│ Domain          │ Entidades TypeScript puras e Interfaces   │
│ Infrastructure  │ Repositorios Prisma, Providers y Mappers  │
└─────────────────┴───────────────────────────────────────────┘
```

### Flujo de Ejecución de una Petición
```text
HTTP Request
     │
     ▼
Route (`.routes.ts`)
     │
     ▼
Middleware (`AuthMiddleware.routeProtect`, `checkPermission`, `ValidatedMiddleware`)
     │
     ▼
Controller (`.controller.ts` hereda de `BaseController`)
     │
     ▼
Use Case (`.usecase.ts`) ──> `AuditLogService.record(...)`
     │
     ▼
Repository Interface (`.repository.ts` en Domain)
     │
     ▼
Prisma Repository (`prisma-*.repository.ts` en Infrastructure)
     │
     ▼
MySQL Database
```

---

## 2. Módulos del Sistema

1. **`Auth`**: Autenticación mediante JWT (Access Token + Refresh Token), verificación de identidad por OTP y recuperación/restablecimiento de contraseña.
2. **`Users`**: Gestión integral de usuarios (CRUD, activación/desactivación lógica, reseteo de clave, cambio de contraseña y asignación de roles).
3. **`Roles` & `Permissions`**: Control de acceso basado en roles (RBAC), catálogo de permisos y matriz de asignación granular de permisos por rol.
4. **`Audit`**: Registro auditable e inmutable de operaciones de seguridad (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`) con cálculo automático de diferencias (diffs) y saneamiento de datos sensibles.

---

## 3. Seguridad y Control de Acceso (RBAC)

### Sistema de Autenticación y Tokens
* **Access Token**: JWT de corta duración (15 min) enviado en el encabezado `Authorization: Bearer <token>`. Contiene el payload del usuario autenticado, sus roles y permisos asignados.
* **Refresh Token**: Token de larga duración (7 días) emitido en una cookie `httpOnly` y persistido en base de datos (`UserSession`) para garantizar una única sesión activa por usuario con revocación instantánea.
* **OTP (One-Time Password)**: Integración desacoplada con el microservicio central de OTP para verificación de identidad y restablecimiento de contraseña.

### Formato de Respuestas HTTP
Todas las respuestas siguen el estándar `ResponseHttp`:

* **Éxito Estándar**:
  ```json
  {
    "status": "success",
    "message": "Operación completada con éxito",
    "data": { ... }
  }
  ```

* **Paginación / Listado**:
  ```json
  {
    "status": "success",
    "message": "Datos obtenidos correctamente",
    "data": [ ... ],
    "count": 10,
    "meta": {
      "total": 45,
      "limit": 10,
      "offset": 0
    }
  }
  ```

* **Error**:
  ```json
  {
    "status": "error",
    "message": "Descripción comprensible del error",
    "code": "ERROR_CODE",
    "data": null
  }
  ```

---

## 4. Catálogo de Permisos del Sistema

| Permiso | Descripción |
| :--- | :--- |
| `users:read` | Consultar usuarios y detalles de perfil |
| `users:create` | Registrar nuevos usuarios |
| `users:update` | Actualizar información, roles o contraseñas |
| `users:delete` | Desactivar o eliminar usuarios |
| `roles:read` | Consultar roles y permisos del sistema |
| `roles:create` | Crear nuevos roles |
| `roles:update` | Editar nombre o descripción de roles |
| `roles:delete` | Eliminar roles no del sistema |
| `roles:permissions:update` | Modificar la matriz de permisos por rol |
| `audit:read` | Consultar bitácora de auditoría |

---

## 5. Especificación de Endpoints

### 5.1 Módulo: Authentication (`/api/auth`)

#### `POST /api/auth/login`
* **Autenticación**: Pública
* **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
* **Respuesta Exitosa (200 OK)**: Retorna datos del usuario autenticado, `token` (Access Token) y configura cookie `refreshToken`.

#### `POST /api/auth/refresh`
* **Autenticación**: Cookie `refreshToken`
* **Respuesta Exitosa (200 OK)**: Emite un nuevo `accessToken` y actualiza la sesión.

#### `POST /api/auth/logout`
* **Autenticación**: Requerida (`routeProtect`)
* **Respuesta Exitosa (200 OK)**: Invalida la sesión activa en `user_sessions` y limpia las cookies.

#### `GET /api/auth/me`
* **Autenticación**: Requerida (`routeProtect`)
* **Respuesta Exitosa (200 OK)**: Retorna el perfil del usuario autenticado con roles y permisos.

#### `POST /api/auth/otp/send`
* **Autenticación**: Pública
* **Body**:
  ```json
  {
    "email": "user@example.com",
    "type": "PASSWORD_RESET"
  }
  ```
* **Respuesta Exitosa (200 OK)**: Solicita el envío del código OTP a través del microservicio.

#### `POST /api/auth/otp/verify`
* **Autenticación**: Pública
* **Body**:
  ```json
  {
    "email": "user@example.com",
    "code": "123456",
    "type": "PASSWORD_RESET"
  }
  ```
* **Respuesta Exitosa (200 OK)**: Retorna `resetToken` de un solo uso para autorizar el cambio de contraseña.

#### `POST /api/auth/reset-password`
* **Autenticación**: Pública (Protegida por `resetToken`)
* **Body**:
  ```json
  {
    "email": "user@example.com",
    "resetToken": "jwt-single-use-token",
    "newPassword": "NewSecurePassword123!",
    "confirmPassword": "NewSecurePassword123!"
  }
  ```
* **Respuesta Exitosa (200 OK)**: Actualiza el hash de la contraseña en la base de datos con Argon2.

---

### 5.2 Módulo: Users (`/api/users`)

#### `GET /api/users`
* **Autenticación**: Requerida | **Permiso**: `users:read`
* **Query Params**: `page` (int), `limit` (int), `search` (string)
* **Respuesta Exitosa (200 OK)**: Lista de usuarios con paginación.

#### `POST /api/users`
* **Autenticación**: Requerida | **Permiso**: `users:create`
* **Body**:
  ```json
  {
    "email": "nuevo.usuario@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "password": "Password123!",
    "roles": ["USER"],
    "autoGeneratePassword": false
  }
  ```
* **Respuesta Exitosa (201 Created)**: Retorna el usuario creado y despacha credenciales iniciales por correo.

#### `PUT /api/users/:id`
* **Autenticación**: Requerida | **Permiso**: `users:update`
* **Body**:
  ```json
  {
    "firstName": "Juan Carlos",
    "lastName": "Pérez",
    "roles": ["USER", "ADMIN"]
  }
  ```
* **Respuesta Exitosa (200 OK)**: Retorna los datos actualizados del usuario.

#### `PATCH /api/users/:id/activate`
* **Autenticación**: Requerida | **Permiso**: `users:update`
* **Respuesta Exitosa (200 OK)**: Reactiva el usuario (`isActive = true`).

#### `PATCH /api/users/:id/disable`
* **Autenticación**: Requerida | **Permiso**: `users:update`
* **Respuesta Exitosa (200 OK)**: Desactiva lógicamente al usuario (`isActive = false`).

#### `DELETE /api/users/:id`
* **Autenticación**: Requerida | **Permiso**: `users:delete`
* **Respuesta Exitosa (200 OK)**: Elimina o desactiva lógicamente el usuario.

#### `PATCH /api/users/me/password`
* **Autenticación**: Requerida (`routeProtect`)
* **Body**:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }
  ```
* **Respuesta Exitosa (200 OK)**: Actualiza la contraseña del usuario logueado.

#### `GET /api/users/roles`
* **Autenticación**: Requerida | **Permiso**: `users:create`, `users:update`, `roles:read`, o `users:read`
* **Respuesta Exitosa (200 OK)**: Retorna el listado de roles disponibles para asignación.

---

### 5.3 Módulo: Roles & Permissions (`/api/roles`, `/api/permissions`)

#### `GET /api/roles`
* **Autenticación**: Requerida | **Permiso**: `roles:read`
* **Respuesta Exitosa (200 OK)**: Lista de roles definidos en el sistema.

#### `POST /api/roles`
* **Autenticación**: Requerida | **Permiso**: `roles:create`
* **Body**:
  ```json
  {
    "name": "AUDITOR",
    "description": "Rol para inspección de bitácoras de auditoría"
  }
  ```
* **Respuesta Exitosa (201 Created)**: Rol creado.

#### `GET /api/roles/:id`
* **Autenticación**: Requerida | **Permiso**: `roles:read`
* **Respuesta Exitosa (200 OK)**: Detalle del rol solicitado.

#### `PATCH /api/roles/:id` / `PUT /api/roles/:id`
* **Autenticación**: Requerida | **Permiso**: `roles:update`
* **Body**:
  ```json
  {
    "name": "AUDITOR_SENIOR",
    "description": "Auditor principal con permisos de solo lectura"
  }
  ```
* **Respuesta Exitosa (200 OK)**: Rol actualizado.

#### `DELETE /api/roles/:id`
* **Autenticación**: Requerida | **Permiso**: `roles:delete`
* **Respuesta Exitosa (200 OK)**: Rol eliminado (los roles marcados como `isSystem: true` están protegidos).

#### `GET /api/roles/matrix`
* **Autenticación**: Requerida | **Permiso**: `roles:read` o `roles:permissions:update`
* **Respuesta Exitosa (200 OK)**: Retorna la estructura completa de roles, catálogo de permisos y asignaciones actuales para renderizar la matriz de permisos.

#### `GET /api/roles/permissions` / `GET /api/permissions`
* **Autenticación**: Requerida | **Permiso**: `roles:read` o `roles:permissions:update`
* **Respuesta Exitosa (200 OK)**: Retorna el catálogo completo de permisos disponibles.

#### `GET /api/roles/:roleId/permissions`
* **Autenticación**: Requerida | **Permiso**: `roles:read` o `roles:permissions:update`
* **Respuesta Exitosa (200 OK)**: Retorna los permisos asignados a un rol específico.

#### `PUT /api/roles/:roleId/permissions`
* **Autenticación**: Requerida | **Permiso**: `roles:permissions:update` o `roles:update`
* **Body**:
  ```json
  {
    "permissionIds": ["uuid-perm-1", "uuid-perm-2"]
  }
  ```
* **Respuesta Exitosa (200 OK)**: Actualiza atómicamente la lista de permisos asignados al rol.

---

### 5.4 Módulo: Audit Logs (`/api/audit`, `/api/audit-logs`)

#### `GET /api/audit` / `GET /api/audit-logs`
* **Autenticación**: Requerida | **Permiso**: `audit:read`
* **Query Params**: `page`, `limit`, `resource`, `action`, `userId`
* **Respuesta Exitosa (200 OK)**: Retorna el historial cronológico de auditoría con datos del usuario responsable, acción ejecutada y metadatos JSON.

#### `GET /api/audit/:id` / `GET /api/audit-logs/:id`
* **Autenticación**: Requerida | **Permiso**: `audit:read`
* **Respuesta Exitosa (200 OK)**: Detalle individual de un registro de auditoría incluyendo diff completo.
