# Documentación de la API Backend (Web Admin System)

Esta documentación describe el estado real del backend de la plataforma, construido siguiendo los principios de **Arquitectura Limpia (Clean Architecture)** y **Arquitectura Hexagonal (Puertos y Adaptadores)** con Node.js, Express, TypeScript y Prisma ORM.

---

## 1. Arquitectura del Sistema

El backend está organizado en módulos desacoplados bajo `src/modules/` y utilidades compartidas bajo `src/shared/` y `src/app/`. Cada módulo de negocio implementa 4 capas estrictas:

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
2. **`Users`**: Gestión integral de usuarios (CRUD, activación/desactivación lógica, reseteo de clave, asignación de roles).
3. **`Roles`**: Control de acceso basado en roles (RBAC) y matriz de asignación granular de permisos.
4. **`Audit`**: Registro auditable e inmutable de operaciones (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`) con cálculo automático de diferencias (diffs) y saneamiento de datos sensibles.
5. **`Websites`**: Gestión de sitios web, dominios registrados, proveedores de hosting y credenciales API (`api_key`) para integraciones headless.

---

## 3. Seguridad y Control de Acceso (RBAC)

### Sistema de Autenticación y Tokens
* **Access Token**: JWT de corta duración enviado en el encabezado `Authorization: Bearer <token>`. Contiene los claims del usuario, sus roles y permisos asignados.
* **Refresh Token**: Token de larga duración almacenado en base de datos (`UserSession`) para mantener sesiones seguras y soportar revocación instantánea.
* **OTP (One-Time Password)**: Integración con microservicio de correos OTP para validación de segundo factor en activación de cuentas y recuperación de contraseñas.

### Formato de Respuestas HTTP
Todas las respuestas siguen el estándar `ResponseHttp`:
* **Éxito Estándar**:
  ```json
  {
    "status": "success",
    "message": "Operation completed successfully",
    "data": { ... }
  }
  ```
* **Paginación**:
  ```json
  {
    "status": "success",
    "message": "Items fetched successfully",
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
    "message": "Error description",
    "code": "ERROR_CODE",
    "data": null
  }
  ```

---

## 4. Catálogo de Permisos del Sistema

| Permiso | Descripción |
| :--- | :--- |
| `users:read` | Consultar usuarios y perfiles |
| `users:create` | Registrar nuevos usuarios |
| `users:update` | Actualizar información, roles o contraseñas |
| `users:delete` | Desactivar o eliminar usuarios |
| `roles:read` | Consultar roles y permisos disponibles |
| `roles:create` | Crear nuevos roles de sistema |
| `roles:update` | Editar nombre o descripción de roles |
| `roles:delete` | Eliminar roles no protegidos |
| `roles:permissions:update` | Modificar la matriz de permisos por rol |
| `audit:read` | Consultar bitácora de auditoría |
| `websites:read` | Consultar sitios web registrados y detalles |
| `websites:create` | Registrar nuevos sitios web |
| `websites:update` | Editar dominio, hosting o regenerar API key |
| `websites:delete` | Eliminar sitios web |
| `content-types:read` | Consultar tipos de contenido de un sitio web |
| `content-types:create` | Crear nuevos tipos de contenido |
| `content-types:update` | Editar nombre, slug o descripción de tipos de contenido |
| `content-types:delete` | Eliminar tipos de contenido y esquemas asociados |
| `content-fields:read` | Consultar campos estructurales de un tipo de contenido |
| `content-fields:create` | Agregar campos a la estructura del tipo de contenido |
| `content-fields:update` | Editar nombre, key, tipo o requerimiento de campos |
| `content-fields:delete` | Eliminar campos del esquema de contenido |

---

## 5. Especificación de Endpoints

### 5.1 Módulo: Authentication (`/api/v1/auth`)

#### `POST /auth/login`
* **Autenticación**: Pública
* **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
* **Respuesta (200)**: Retorna datos del usuario autenticado, `token` (Access Token) y configura cookie para Refresh Token.

#### `POST /auth/logout`
* **Autenticación**: Requerida (`routeProtect`)
* **Respuesta (200)**: Invalida la sesión activa del usuario.

#### `GET /auth/profile`
* **Autenticación**: Requerida (`routeProtect`)
* **Respuesta (200)**: Retorna el perfil completo del usuario autenticado en `res.locals.user`.

#### `POST /auth/refresh-token`
* **Autenticación**: Cookie de sesión o header de refresh
* **Respuesta (200)**: Emite un nuevo `accessToken`.

#### `POST /auth/send-otp`
* **Autenticación**: Pública
* **Body**:
  ```json
  {
    "email": "user@example.com",
    "type": "PASSWORD_RESET" | "ACTIVATION"
  }
  ```
* **Respuesta (200)**: Envía código numérico de un solo uso por correo.

#### `POST /auth/verify-otp`
* **Autenticación**: Pública
* **Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "type": "PASSWORD_RESET"
  }
  ```
* **Respuesta (200)**: Retorna un `resetToken` de un solo uso para autorizar el cambio de contraseña.

#### `POST /auth/reset-password-with-otp`
* **Autenticación**: Pública (Protegida por `resetToken`)
* **Body**:
  ```json
  {
    "email": "user@example.com",
    "resetToken": "uuid-single-use-token",
    "newPassword": "NewSecurePassword123!"
  }
  ```
* **Respuesta (200)**: Actualiza el hash de contraseña en la base de datos e invalida el `resetToken`.

---

### 5.2 Módulo: Users (`/api/v1/users`)

#### `GET /users`
* **Autenticación**: Requerida | **Permiso**: `users:read`
* **Query Params**: `page` (int), `limit` (int), `q` (string)
* **Respuesta (200)**: Lista paginada de usuarios.

#### `GET /users/roles`
* **Autenticación**: Requerida | **Permiso**: `users:read`
* **Respuesta (200)**: Lista de roles disponibles para asignación.

#### `POST /users`
* **Autenticación**: Requerida | **Permiso**: `users:create`
* **Body**:
  ```json
  {
    "email": "nuevo@empresa.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "roles": ["ADMIN"],
    "passwordRaw": "OpcionalSiAutoGenEsTrue",
    "autoGeneratePassword": true
  }
  ```
* **Respuesta (201)**: Usuario creado y correo de bienvenida despachado.

#### `PUT /users/:id`
* **Autenticación**: Requerida | **Permiso**: `users:update`
* **Body**:
  ```json
  {
    "firstName": "Juan Carlos",
    "lastName": "Pérez",
    "email": "nuevo.email@empresa.com",
    "roles": ["USER"]
  }
  ```
* **Respuesta (200)**: Usuario actualizado con registro en auditoría.

#### `PATCH /users/:id/disable`
* **Autenticación**: Requerida | **Permiso**: `users:delete`
* **Respuesta (200)**: Cambia `isActive` a `false`.

#### `PATCH /users/:id/activate`
* **Autenticación**: Requerida | **Permiso**: `users:update`
* **Respuesta (200)**: Cambia `isActive` a `true` e `isVerify` a `true`.

#### `POST /users/change-password`
* **Autenticación**: Requerida | **Permiso**: Autenticado
* **Body**:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!"
  }
  ```
* **Respuesta (200)**: Contraseña actualizada desde el perfil.

---

### 5.3 Módulo: Roles & Permissions (`/api/v1/roles`, `/api/v1/permissions`)

#### `GET /roles`
* **Autenticación**: Requerida | **Permiso**: `roles:read`
* **Respuesta (200)**: Lista todos los roles existentes.

#### `POST /roles`
* **Autenticación**: Requerida | **Permiso**: `roles:create`
* **Body**: `{ "name": "EDITOR", "description": "Editor de contenidos" }`
* **Respuesta (201)**: Rol creado.

#### `GET /roles/:id`
* **Autenticación**: Requerida | **Permiso**: `roles:read`
* **Respuesta (200)**: Detalles de un rol y sus permisos vinculados.

#### `PUT /roles/:id`
* **Autenticación**: Requerida | **Permiso**: `roles:update`
* **Body**: `{ "name": "EDITOR_SENIOR", "description": "Editor con permisos avanzados" }`
* **Respuesta (200)**: Rol actualizado.

#### `DELETE /roles/:id`
* **Autenticación**: Requerida | **Permiso**: `roles:delete`
* **Respuesta (200)**: Rol eliminado (los roles `isSystem: true` están protegidos).

#### `GET /roles/:id/permissions`
* **Autenticación**: Requerida | **Permiso**: `roles:read`
* **Respuesta (200)**: Arreglo de IDs de permisos asignados al rol.

#### `PUT /roles/:id/permissions`
* **Autenticación**: Requerida | **Permiso**: `roles:permissions:update`
* **Body**: `{ "permissionIds": ["uuid-perm-1", "uuid-perm-2"] }`
* **Respuesta (200)**: Permisos asignados actualizados atómicamente.

#### `GET /roles/matrix/data`
* **Autenticación**: Requerida | **Permiso**: `roles:read`
* **Respuesta (200)**: Estructura completa de la matriz (`roles`, `permissions`, `assignments`).

#### `GET /permissions`
* **Autenticación**: Requerida | **Permiso**: `roles:read`
* **Respuesta (200)**: Catálogo completo de permisos del sistema.

---

### 5.4 Módulo: Audit (`/api/v1/audit-logs`)

#### `GET /audit-logs`
* **Autenticación**: Requerida | **Permiso**: `audit:read`
* **Query Params**: `page`, `limit`, `resource`, `action`, `userId`
* **Respuesta (200)**: Lista paginada de registros de auditoría.

#### `GET /audit-logs/:id`
* **Autenticación**: Requerida | **Permiso**: `audit:read`
* **Respuesta (200)**: Detalle del log con diferencias (`before`, `after`, `changes`, metadatos de IP y User-Agent).

---

### 5.5 Módulo: Websites (`/api/v1/websites`)

#### `GET /websites`
* **Autenticación**: Requerida | **Permiso**: `websites:read`
* **Query Params**: `page` (int), `limit` (int), `search` (string), `isActive` (boolean), `ownerId` (uuid)
* **Respuesta (200)**:
  ```json
  {
    "status": "success",
    "message": "Websites fetched successfully",
    "data": [
      {
        "id": "c1384074-a095-467f-85ea-2df02e1cbf67",
        "name": "Portal Corporativo",
        "domain": "portal.empresa.com",
        "apiKey": "f7d2e461-8cf1-4560-b8bf-49f4c39999be",
        "hostingProvider": "Cloudflare Pages",
        "hostingNotes": "DNS gestionado en Cloudflare. Build Astro SSR.",
        "isActive": true,
        "ownerId": "9534011c-2e98-47a6-b8e4-3fea3df28465",
        "owner": {
          "id": "9534011c-2e98-47a6-b8e4-3fea3df28465",
          "firstName": "Administrador",
          "lastName": "Sistema",
          "email": "admin@empresa.com"
        },
        "createdAt": "2026-10-07T18:00:00.000Z",
        "updatedAt": "2026-10-07T18:00:00.000Z"
      }
    ],
    "count": 1,
    "meta": {
      "total": 1,
      "limit": 10,
      "offset": 0
    }
  }
  ```

#### `GET /websites/:id`
* **Autenticación**: Requerida | **Permiso**: `websites:read`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Objeto `Website` con información detallada de configuración y propietario.

#### `POST /websites`
* **Autenticación**: Requerida | **Permiso**: `websites:create`
* **Body**:
  ```json
  {
    "name": "Blog Principal",
    "domain": "blog.empresa.com",
    "hostingProvider": "Vercel",
    "hostingNotes": "Despliegues continuos desde GitHub main",
    "isActive": true,
    "ownerId": "uuid-opcional"
  }
  ```
* **Respuesta (201)**: `Website` creado con `apiKey` UUID autogenerada y registro de auditoría (`CREATE`).

#### `PUT /websites/:id`
* **Autenticación**: Requerida | **Permiso**: `websites:update`
* **Body**:
  ```json
  {
    "name": "Blog Corporativo",
    "domain": "blog.empresa.com",
    "hostingProvider": "AWS Amplify",
    "hostingNotes": "Migrado a AWS Amplify",
    "isActive": true
  }
  ```
* **Respuesta (200)**: `Website` actualizado con registro de auditoría (`UPDATE`) y cálculo de diferencias.

#### `POST /websites/:id/regenerate-api-key`
* **Autenticación**: Requerida | **Permiso**: `websites:update`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Genera y guarda un nuevo `apiKey` UUID seguro, registrando el evento en auditoría.

#### `DELETE /websites/:id`
* **Autenticación**: Requerida | **Permiso**: `websites:delete`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Elimina el sitio web con registro de auditoría (`DELETE`).

---

### 5.6 Módulo: Content Types (`/api/v1/content-types`, `/api/v1/websites/:websiteId/content-types`)

Representa la definición de esquemas de contenido dinámico (Headless CMS) asociados a un sitio web.

#### `GET /websites/:websiteId/content-types`
* **Autenticación**: Requerida | **Permiso**: `content-types:read`
* **Params**: `websiteId` (uuid)
* **Query Params**: `page` (int), `limit` (int), `search` (string)
* **Respuesta (200)**:
  ```json
  {
    "status": "success",
    "message": "Content types fetched successfully",
    "data": [
      {
        "id": "e8574766-3d23-455b-b9f4-18fa227bb309",
        "websiteId": "c1384074-a095-467f-85ea-2df02e1cbf67",
        "name": "Productos",
        "slug": "productos",
        "description": "Catálogo de productos para tienda digital",
        "fieldsCount": 4,
        "itemsCount": 0,
        "createdAt": "2026-10-07T19:00:00.000Z",
        "updatedAt": "2026-10-07T19:00:00.000Z"
      }
    ],
    "count": 1,
    "meta": {
      "total": 1,
      "limit": 10,
      "offset": 0
    }
  }
  ```

#### `GET /content-types/:id`
* **Autenticación**: Requerida | **Permiso**: `content-types:read`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Objeto `ContentType` con metadatos y conteo de campos e items.

#### `POST /websites/:websiteId/content-types`
* **Autenticación**: Requerida | **Permiso**: `content-types:create`
* **Params / Body**:
  ```json
  {
    "name": "Blog Posts",
    "slug": "blog-posts",
    "description": "Artículos editoriales y noticias del portal"
  }
  ```
* **Reglas de Negocio**:
  - El sitio web debe existir.
  - El `slug` debe ser único dentro del mismo sitio web (`@@unique([websiteId, slug])`).
  - El formato del slug debe ser `lowercase-kebab-case` (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`).
* **Respuesta (201)**: `ContentType` creado con registro en auditoría (`action: CREATE`, `resource: content_types`).

#### `PUT /content-types/:id`
* **Autenticación**: Requerida | **Permiso**: `content-types:update`
* **Params**: `id` (uuid)
* **Body**:
  ```json
  {
    "name": "Artículos & Blog",
    "slug": "articulos-blog",
    "description": "Actualizado para incluir artículos técnicos"
  }
  ```
* **Respuesta (200)**: `ContentType` actualizado con registro en auditoría (`action: UPDATE`, `resource: content_types`).

#### `DELETE /content-types/:id`
* **Autenticación**: Requerida | **Permiso**: `content-types:delete`
* **Params**: `id` (uuid)
* **Comportamiento Destructivo**: La eliminación en cascada de base de datos (`onDelete: Cascade`) remueve automáticamente los `ContentField` y `ContentItem` asociados.
* **Respuesta (200)**: Registro en auditoría (`action: DELETE`, `resource: content_types`).

---

### 5.7 Módulo: Content Fields (`/api/v1/content-fields`, `/api/v1/content-types/:contentTypeId/fields`)

Define los atributos estructurales de un `ContentType` para generar dinámicamente formularios y validar los campos del JSON `data` en futuros `ContentItem`.

#### Tipos de Campo Soportados (`FieldType`)
* `STRING`: Texto corto de una sola línea (ej. título, subtítulo, sku).
* `TEXT`: Texto largo / multilínea / markdown (ej. contenido, descripción).
* `NUMBER`: Números enteros o decimales (ej. precio, stock, orden).
* `BOOLEAN`: Banderas booleanas verdadero / falso (ej. enStock, destacado).
* `DATE`: Fechas y timestamps (ej. fechaPublicacion, fechaEvento).
* `JSON`: Cargas de datos estructuradas arbitrarias (ej. configuraciones, metadata).
* `URL`: Enlaces web o URLs de recursos externos.

#### `GET /content-types/:contentTypeId/fields`
* **Autenticación**: Requerida | **Permiso**: `content-fields:read`
* **Params**: `contentTypeId` (uuid)
* **Respuesta (200)**:
  ```json
  {
    "status": "success",
    "message": "Content fields fetched successfully",
    "data": [
      {
        "id": "7b8f9e12-4c5a-4e2b-a7e8-091a2b3c4d5e",
        "contentTypeId": "e8574766-3d23-455b-b9f4-18fa227bb309",
        "name": "Precio",
        "key": "price",
        "type": "NUMBER",
        "isRequired": true,
        "createdAt": "2026-10-07T19:05:00.000Z"
      },
      {
        "id": "1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6",
        "contentTypeId": "e8574766-3d23-455b-b9f4-18fa227bb309",
        "name": "En Stock",
        "key": "in_stock",
        "type": "BOOLEAN",
        "isRequired": false,
        "createdAt": "2026-10-07T19:06:00.000Z"
      }
    ]
  }
  ```

#### `GET /content-fields/:id`
* **Autenticación**: Requerida | **Permiso**: `content-fields:read`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Objeto `ContentField`.

#### `POST /content-types/:contentTypeId/fields`
* **Autenticación**: Requerida | **Permiso**: `content-fields:create`
* **Params**: `contentTypeId` (uuid)
* **Body**:
  ```json
  {
    "name": "Precio de Venta",
    "key": "sale_price",
    "type": "NUMBER",
    "isRequired": true
  }
  ```
* **Reglas de Negocio**:
  - `contentTypeId` debe existir.
  - `key` debe ser único dentro del mismo `ContentType` (`@@unique([contentTypeId, key])`).
  - `key` solo puede contener caracteres alfanuméricos en minúscula y guiones bajos (`/^[a-z0-9_]+$/`).
  - `type` debe pertenecer a `FieldType` enum.
* **Respuesta (201)**: Campo creado y registrado en auditoría (`action: CREATE`, `resource: content_fields`).

#### `PUT /content-fields/:id`
* **Autenticación**: Requerida | **Permiso**: `content-fields:update`
* **Params**: `id` (uuid)
* **Body**:
  ```json
  {
    "name": "Precio Minorista",
    "key": "sale_price",
    "type": "NUMBER",
    "isRequired": false
  }
  ```
* **Respuesta (200)**: Campo actualizado y registrado en auditoría (`action: UPDATE`, `resource: content_fields`).

#### `DELETE /content-fields/:id`
* **Autenticación**: Requerida | **Permiso**: `content-fields:delete`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Campo eliminado del esquema y registrado en auditoría (`action: DELETE`, `resource: content_fields`).

---

## 9. Módulo Email Templates

Permite a cada `Website` gestionar sus plantillas de correo electrónico reutilizables (ej: notificaciones de formularios de contacto, bienvenida, recibos, etc.) con soporte para sintaxis de variables dinámicas (`{{name}}`, `{{email}}`, etc.).

### Permisos del Módulo
* `email-templates:create`: Crear plantillas de correo electrónico.
* `email-templates:read`: Consultar y visualizar plantillas de correo.
* `email-templates:update`: Modificar plantillas existentes.
* `email-templates:delete`: Eliminar plantillas de correo.

### Endpoints

#### `GET /websites/:websiteId/email-templates`
* **Autenticación**: Requerida | **Permiso**: `email-templates:read`
* **Params**: `websiteId` (uuid)
* **Query Params**:
  * `page` (number, default: 1)
  * `limit` (number, default: 10)
  * `search` (string, opcional): Búsqueda por nombre, subject o contenido.
* **Respuesta (200)**:
  ```json
  {
    "status": "success",
    "message": "Email templates fetched successfully",
    "data": [
      {
        "id": "78328bf3-90d2-43fa-b054-93820fa929d1",
        "websiteId": "fa9f1f0a-3ec7-4ecf-9556-3c076735be52",
        "name": "Contact Form Notification",
        "subject": "New contact received from {{name}}",
        "htmlContent": "<!DOCTYPE html><html>...</html>",
        "formsCount": 1,
        "createdAt": "2026-10-07T19:30:00.000Z",
        "updatedAt": "2026-10-07T19:30:00.000Z"
      }
    ],
    "count": 1,
    "meta": {
      "total": 1,
      "limit": 10,
      "offset": 0
    }
  }
  ```

#### `GET /email-templates/:id`
* **Autenticación**: Requerida | **Permiso**: `email-templates:read`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Objeto `EmailTemplate`.

#### `POST /websites/:websiteId/email-templates`
* **Autenticación**: Requerida | **Permiso**: `email-templates:create`
* **Params**: `websiteId` (uuid)
* **Body**:
  ```json
  {
    "name": "Contact Form Notification",
    "subject": "New contact received from {{name}}",
    "htmlContent": "<!DOCTYPE html><html><body><h1>New Contact</h1><p>{{message}}</p></body></html>"
  }
  ```
* **Reglas de Negocio**:
  - `websiteId` debe pertenecer a un Website existente.
  - `name`, `subject` y `htmlContent` son campos obligatorios.
* **Respuesta (201)**: Plantilla creada y registrada en auditoría (`action: CREATE`, `resource: email_templates`).

#### `PUT /email-templates/:id`
* **Autenticación**: Requerida | **Permiso**: `email-templates:update`
* **Params**: `id` (uuid)
* **Body**:
  ```json
  {
    "name": "Updated Notification Template",
    "subject": "Inquiry update from {{name}}",
    "htmlContent": "<!DOCTYPE html><html>...</html>"
  }
  ```
* **Respuesta (200)**: Plantilla actualizada y registrada en auditoría (`action: UPDATE`, `resource: email_templates`).

#### `DELETE /email-templates/:id`
* **Autenticación**: Requerida | **Permiso**: `email-templates:delete`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Plantilla eliminada y registrada en auditoría (`action: DELETE`, `resource: email_templates`). Las referencias en `Form.email_template_id` son configuradas automáticamente en `NULL` (`onDelete: SetNull`).

---

## 8. Módulo Forms, FormFields, FormSubmissions y API Pública de Submissions

El módulo **Forms** permite a los sitios web gestionar formularios dinámicos, configurar notificaciones por correo con destinatarios y plantillas asociadas, administrar campos tipados y recibir envíos tanto internamente como desde aplicaciones o sitios web externos mediante autenticación por API Key.

### 8.1. Endpoints Administrativos de Forms

#### `GET /websites/:websiteId/forms`
* **Autenticación**: Requerida | **Permiso**: `forms:read`
* **Params**: `websiteId` (uuid)
* **Query Params**:
  * `offset` (number, default: 0)
  * `limit` (number, default: 10)
  * `search` (string, opcional): Búsqueda por nombre o slug.
* **Respuesta (200)**:
  ```json
  {
    "status": "success",
    "message": "Forms fetched successfully",
    "data": [
      {
        "id": "27814b7e-97d8-4f01-bb1c-43f14ae19ba0",
        "websiteId": "fa9f1f0a-3ec7-4ecf-9556-3c076735be52",
        "name": "Formulario de Contacto",
        "slug": "contact",
        "sendEmail": true,
        "recipientEmails": ["admin@example.com", "sales@example.com"],
        "emailTemplateId": "78328bf3-90d2-43fa-b054-93820fa929d1",
        "emailTemplate": {
          "id": "78328bf3-90d2-43fa-b054-93820fa929d1",
          "name": "Contact Notification Template",
          "subject": "New Contact Message"
        },
        "fieldsCount": 4,
        "submissionsCount": 128,
        "createdAt": "2026-10-07T19:40:00.000Z",
        "updatedAt": "2026-10-07T19:40:00.000Z"
      }
    ],
    "count": 1,
    "meta": {
      "total": 1,
      "limit": 10,
      "offset": 0
    }
  }
  ```

#### `GET /forms/:id`
* **Autenticación**: Requerida | **Permiso**: `forms:read`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Objeto `Form` detallado con `emailTemplate`, `fieldsCount` y `submissionsCount`.

#### `POST /websites/:websiteId/forms`
* **Autenticación**: Requerida | **Permiso**: `forms:create`
* **Params**: `websiteId` (uuid)
* **Body**:
  ```json
  {
    "name": "Formulario de Cotización",
    "slug": "quote-request",
    "sendEmail": true,
    "recipientEmails": ["quotes@example.com"],
    "emailTemplateId": "78328bf3-90d2-43fa-b054-93820fa929d1"
  }
  ```
* **Reglas de Negocio**:
  - `slug` debe ser único dentro del mismo Website (`@@unique([websiteId, slug])`).
  - Si `sendEmail` es `true`, `recipientEmails` debe contener al menos una dirección de email válida y única.
  - Si `emailTemplateId` es provisto, debe pertenecer al mismo Website.
* **Respuesta (201)**: Formulario creado y registrado en auditoría (`action: CREATE`, `resource: forms`).

#### `PUT /forms/:id`
* **Autenticación**: Requerida | **Permiso**: `forms:update`
* **Params**: `id` (uuid)
* **Body**: Campos actualizables (`name`, `slug`, `sendEmail`, `recipientEmails`, `emailTemplateId`).
* **Respuesta (200)**: Formulario actualizado y registrado en auditoría (`action: UPDATE`, `resource: forms`).

#### `DELETE /forms/:id`
* **Autenticación**: Requerida | **Permiso**: `forms:delete`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Formulario eliminado en cascada junto con sus `FormField`s y `FormSubmission`s, y registrado en auditoría (`action: DELETE`, `resource: forms`).

---

### 8.2. Endpoints Administrativos de FormFields

#### `GET /forms/:formId/fields`
* **Autenticación**: Requerida | **Permiso**: `form-fields:read`
* **Params**: `formId` (uuid)
* **Respuesta (200)**: Lista de campos tipados configurados para el formulario.

#### `POST /forms/:formId/fields`
* **Autenticación**: Requerida | **Permiso**: `form-fields:create`
* **Params**: `formId` (uuid)
* **Body**:
  ```json
  {
    "label": "Correo Electrónico",
    "key": "email",
    "type": "STRING",
    "isRequired": true
  }
  ```
* **Tipos Soportados (`FieldType`)**: `STRING`, `TEXT`, `NUMBER`, `BOOLEAN`, `DATE`, `JSON`, `URL`.
* **Reglas de Negocio**:
  - `key` debe ser alfanumérico en minúsculas, guiones bajos o medios, y único dentro del formulario (`@@unique([formId, key])`).
* **Respuesta (201)**: Campo creado y registrado en auditoría (`action: CREATE`, `resource: form_fields`).

#### `POST /forms/:formId/fields/bulk`
* **Autenticación**: Requerida | **Permiso**: `form-fields:create`
* **Params**: `formId` (uuid)
* **Body**:
  ```json
  {
    "fields": [
      { "label": "Nombre Completo", "key": "name", "type": "STRING", "isRequired": true },
      { "label": "Email", "key": "email", "type": "STRING", "isRequired": true },
      { "label": "Mensaje", "key": "message", "type": "TEXT", "isRequired": true }
    ]
  }
  ```

#### `PUT /form-fields/:id`
* **Autenticación**: Requerida | **Permiso**: `form-fields:update`
* **Params**: `id` (uuid)
* **Body**: Campos actualizables (`label`, `key`, `type`, `isRequired`).
* **Respuesta (200)**: Campo actualizado y registrado en auditoría (`action: UPDATE`, `resource: form_fields`).

#### `DELETE /form-fields/:id`
* **Autenticación**: Requerida | **Permiso**: `form-fields:delete`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Campo eliminado y registrado en auditoría (`action: DELETE`, `resource: form_fields`). Las submissions históricas conservan intacto su JSON de datos.

---

### 8.3. Endpoints Administrativos de FormSubmissions

#### `GET /forms/:formId/submissions`
* **Autenticación**: Requerida | **Permiso**: `form-submissions:read`
* **Params**: `formId` (uuid)
* **Query Params**:
  * `offset` (number, default: 0)
  * `limit` (number, default: 10)
  * `status` (string, opcional: `PENDING`, `PROCESSED`, `SPAM`, `FAILED`)
  * `contactId` (string, opcional)
* **Respuesta (200)**: Lista paginada de envíos con información del contacto asociado (`Contact`).

#### `GET /form-submissions/:id`
* **Autenticación**: Requerida | **Permiso**: `form-submissions:read`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Detalle del envío con su objeto `data` dinámico, formulario y contacto.

#### `PUT /form-submissions/:id/status`
* **Autenticación**: Requerida | **Permiso**: `form-submissions:update`
* **Params**: `id` (uuid)
* **Body**:
  ```json
  {
    "status": "PROCESSED"
  }
  ```
* **Respuesta (200)**: Estado del submission actualizado.

#### `DELETE /form-submissions/:id`
* **Autenticación**: Requerida | **Permiso**: `form-submissions:delete`
* **Params**: `id` (uuid)
* **Respuesta (200)**: Submission eliminado.

---

### 8.4. Endpoint Público para Envío de Formularios (Public Submissions)

Diseñado para ser consumido de manera segura por sitios web y aplicaciones cliente externas utilizando el **API Key** del Website.

#### `POST /api/v1/forms/:slug/submit`
* **Autenticación**: **API Key en Header** (`x-api-key: <WEBSITE_API_KEY>`)
* **Params**: `slug` (string, identificador del formulario dentro del Website)
* **Headers**:
  ```http
  POST /api/v1/forms/contact/submit HTTP/1.1
  Host: api.example.com
  x-api-key: fa9f1f0a-3ec7-4ecf-9556-3c076735be52
  Content-Type: application/json
  ```
* **Body**:
  ```json
  {
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "phone": "+503 7777-8888",
    "message": "Hola, solicito información sobre sus servicios."
  }
  ```
* **Mecanismos de Validación y Seguridad**:
  1. **Autenticación por Sitio**: Se valida el `x-api-key` identificando unívocamente el `Website` activo.
  2. **Resolución del Formulario**: Se localiza el `Form` mediante la combinación `websiteId + slug`.
  3. **Validación Dinámica Estricta**:
     - Se comprueba la presencia de todos los campos con `isRequired: true`.
     - Se valida el tipo de dato de cada valor según el `FieldType` del campo (`STRING`, `TEXT`, `NUMBER`, `BOOLEAN`, `DATE`, `JSON`, `URL`).
     - **Rechazo de campos desconocidos**: Cualquier clave en el payload que no esté declarada en los `FormField` del formulario provoca un error `400 Bad Request` (`UNKNOWN_FORM_FIELD`).
  4. **Resolución de Contacto**: Si el payload contiene un campo de correo (`email`, `correo`, `mail`), el caso de uso busca o crea automáticamente un registro `Contact` asociado al `websiteId` y vincula el `contactId` en el `FormSubmission`.
  5. **Estado Inicial**: Toda submission se crea con estado `PENDING`.
* **Respuesta Exitosa (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "Form submission received successfully",
    "data": {
      "submissionId": "b1b0b4b8-f1c2-48c9-943e-a16972049e7b",
      "status": "PENDING",
      "createdAt": "2026-10-07T19:45:00.000Z"
    }
  }
  ```
* **Respuestas de Error**:
  - `401 Unauthorized`: API Key ausente o inválida.
  - `404 Not Found`: Formulario no encontrado para el Website asociado a la API Key.
  - `400 Bad Request`: Campo obligatorio faltante, tipo de dato inválido o campo no reconocido.

---

## 9. Módulo Email y Proveedor Desacoplado (Resend)

El módulo **Email** proporciona una infraestructura desacoplada y tipada para la entrega de correos electrónicos transaccionales y notificaciones de formularios dinámicos a través del proveedor oficial **Resend**.

### 9.1. Arquitectura de Proveedores (`IEmailProvider`)

La lógica de negocio y los casos de uso (`Forms`, `Users`, etc.) dependen exclusivamente de la abstracción de dominio `IEmailProvider`, evitando el acoplamiento directo con SDKs de terceros:

```text
┌──────────────────────────────┐
│  Casos de Uso / Dominios     │  (e.g., SubmitPublicFormUseCase, SendEmailUseCase)
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   IEmailProvider (Contract)  │  src/modules/Email/domain/email.provider.ts
└──────────────┬───────────────┘
               │
       ┌───────┴────────────────────────┐
       ▼                                ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│  ResendEmailProvider (Prod)  │ │   MockEmailProvider (Test)   │
└──────────────┬───────────────┘ └──────────────────────────────┘
               │
               ▼
           Resend API
```

* **Separación OTP:** Las operaciones de generación y verificación de códigos OTP son responsabilidad exclusiva del microservicio independiente externo.
* **Configuración Centralizada:** La clave de API se obtiene de forma segura a través de `config.resendApiKey` (`RESEND_API_KEY`), y el remitente a través de `config.emailFrom` (`EMAIL_FROM`), sin exponer credenciales en logs ni respuestas HTTP.

### 9.2. Motor de Renderizado Seguro (`TemplateRenderer`)

Para combinar las plantillas de correo (`EmailTemplate`) con los datos dinámicos recibidos en formularios (`FormSubmission.data`), el sistema utiliza `TemplateRenderer`:
* **Sustitución Textual Segura:** Reemplaza patrones `{{variable}}` y `{{ variable }}` sin ejecutar código JavaScript ni utilizar `eval`.
* **Soporte en Asunto y Cuerpo:** Resuelve variables tanto en `subject` como en `htmlContent`.
* **Manejo de Campos Inexistentes:** Variables no provistas en el payload son sustituidas limpiamente por cadenas vacías `""`.

### 9.3. Endpoint de Envío de Correo Administrativo

#### `POST /api/emails/send`
* **Autenticación**: Requerida | **Permiso**: `emails:send`
* **Headers**: `Authorization: Bearer <token>`
* **Body**:
  ```json
  {
    "to": ["destinatario@example.com", "ventas@example.com"],
    "subject": "Notificación de Actualización del Sistema",
    "html": "<h1>Estimado usuario</h1><p>Tu solicitud ha sido procesada con éxito.</p>",
    "text": "Estimado usuario, tu solicitud ha sido procesada con éxito."
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Email dispatched successfully",
    "data": {
      "success": true,
      "message": "Email sent successfully",
      "messageId": "01a10e73-b3c4-4b5a-93e1-209840192834"
    }
  }
  ```


