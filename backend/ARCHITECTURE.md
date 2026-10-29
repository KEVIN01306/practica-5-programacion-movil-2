# Arquitectura del Backend (Clean / Hexagonal Architecture)

Este proyecto está construido siguiendo los principios de la **Arquitectura Limpia (Clean Architecture)** y **Arquitectura Hexagonal (Ports and Adapters)**. El objetivo principal es la separación de responsabilidades, asegurando que la lógica de negocio central (el núcleo) no dependa de detalles externos como la base de datos, los frameworks web (Express) o librerías de terceros.

---

## 1. Estructura de Carpetas (Por Módulo)

El código está estructurado en módulos (`Auth`, `Users`, `Roles`, `Audit`), y dentro de cada módulo se divide en 4 capas fundamentales:

### 📁 `domain/` (Dominio)
Es el núcleo de la aplicación. Aquí residen las reglas de negocio más puras.
- **Qué va aquí:** Entidades (modelos de datos puros en TypeScript, sin métodos de base de datos), y las **Interfaces** de los repositorios y proveedores (los "Puertos").
- **Regla de oro:** No debe importar absolutamente nada de las otras capas (`application`, `infrastructure`, `presentation`), ni de librerías externas (como Prisma, Express, etc).

### 📁 `application/` (Aplicación / Casos de Uso)
Contiene la lógica de la aplicación y orquesta el flujo de los datos.
- **Qué va aquí:** Los Casos de Uso (Use Cases). Cada archivo representa una acción específica (ej. `login.usecase.ts`, `get-profile.usecase.ts`).
- **Regla de oro:** 
  - **Manejo de Errores:** Aquí se ejecutan las validaciones lógicas de negocio y **se lanzan los errores usando `throw new AppError(...)`**.
  - **Uso de Repositorios:** Los Use Cases no conocen los detalles de persistencia; invocan exclusivamente los métodos definidos en la interfaz del repositorio del dominio (ej. `this.authRepository.findByEmail()`).

### 📁 `infrastructure/` (Infraestructura)
Esta capa es el límite exterior. Es la única que interactúa con la base de datos o herramientas de terceros.
- **Qué va aquí:** 
  - Implementaciones reales de los repositorios utilizando Prisma (ej. `prisma-auth.repository.ts`, `prisma-users.repository.ts`).
  - Proveedores de servicios reales (ej. `jwt.provider.ts`, `argon2-hash.provider.ts`, `http-otp.provider.ts`, `http-email.provider.ts`).
  - **Mappers:** Transforman los objetos de base de datos (Prisma) a entidades puras de `domain/`.

### 📁 `presentation/` (Presentación)
Es la puerta de entrada a la aplicación (el servidor web HTTP).
- **Qué va aquí:** Controladores (`.controller.ts`), rutas (`.routes.ts`) y esquemas de validación (usando Zod).
- **Regla de oro:** 
  - El controlador **no contiene lógica de negocio**. Recibe la petición HTTP (`req`), extrae los datos, invoca el Caso de Uso y responde (`res`) usando el formato estándar (`ResponseHttp.success`).
  - Todo error es capturado aquí y pasado al middleware global mediante `catch(error) { next(error) }`.

---

## 2. Reglas Principales de Desarrollo

### Inyección de Dependencias (`.module.ts`)
Para mantener el desacoplamiento, **nunca se debe instanciar un repositorio o proveedor dentro de un Use Case o Controller usando `new`**. Todo se inyecta por el constructor.
En la raíz de cada módulo (ej. `auth.module.ts`, `users.module.ts`, `roles.module.ts`, `audit.module.ts`) ocurre el ensamblado:
1. Se instancian Prisma y los proveedores (`HashProvider`, `JwtProvider`, `OtpProvider`, etc.).
2. Se instancia el repositorio real pasándole la DB.
3. Se instancian los casos de uso inyectándoles el repositorio y los proveedores.
4. Finalmente, se instancia el Controller inyectándole los casos de uso para conectarlo con las rutas.

### Validaciones
- **Sintácticas (Zod):** Validaciones de estructura y formato (email válido, longitud de strings, campos requeridos). Se realizan en `presentation/` interceptados por el `ValidatedMiddleware`.
- **Semánticas (Negocio):** Validaciones lógicas (existencia de registros, unicidad, estado de la cuenta). Se ejecutan en los Casos de Uso (`application/`) lanzando `AppError`.

---

## 3. Guía Técnica: Módulo de Autenticación (Auth)

El módulo de Auth gestiona la seguridad mediante JWT, guardando una única sesión activa por usuario en la base de datos (`UserSession`, relación 1 a 1).

### Componentes Clave:
- **`AuthUser` (Dominio):** Define la estructura del usuario en memoria con `id`, `email`, `roles` y `permissions` extraídos relacionalmente.
- **`AuthSession` (Dominio):** Representa la sesión con `token` (RefreshToken), `userId` y `expiresAt`.

### Flujo de Login:
1. **Ruta (`auth.routes.ts`):** Recibe `POST /login` y valida el payload con Zod.
2. **Controller (`auth.controller.ts`):** Invoca `loginUseCase.execute()`.
3. **Use Case (`login.usecase.ts`):**
   - Busca el usuario por email (`authRepository.findByEmail()`).
   - Verifica el estado activo (`isActive`) y la contraseña con Argon2.
   - Genera Access Token (15m) con roles y permisos incrustados, y Refresh Token (7d).
   - Registra o actualiza la sesión única en la base de datos (`upsertSession`).
4. **Respuesta:** Devuelve el Access Token y establece la cookie `httpOnly` para el Refresh Token.

### Middleware de Protección
`AuthMiddleware.routeProtect` extrae y valida el Bearer token, inyectando el usuario en `res.locals.user` para su consumo inmediato sin sobrecargar consultas a la base de datos.

---

## 4. Guía Técnica: Módulo de Usuarios (Users)

Gestiona las identidades del sistema implementando CRUD completo con **eliminación lógica**.

### Entidades y DTOs
- **`CreateUser`**: Tipado para creación de usuarios.
- **`UpdateUser`**: Tipado de campos opcionales permitidos en actualización.
- **`GetUser`**: Entidad de usuario completa omitiendo el `passwordHash`.
- **`GetSimpleUser`**: Versión ligera para listados en masa.

### Casos de Uso:
- **`CreateUserUseCase`**: Hashea contraseñas temporales/definitivas con Argon2, verifica unicidad de email y despacha credenciales vía `HttpEmailProvider` conectado al microservicio de correo.
- **`UpdateUserUseCase`**: Actualiza datos básicos y roles asociados.
- **`ListUsersUseCase`**: Listado paginado de usuarios.
- **`ActivateUserUseCase` / `DisableUserUseCase` / `DeleteUserUseCase`**: Gestión del estado del usuario preservando integridad referencial para auditoría.

---

## 5. Guía Técnica: Módulo de Roles y Permisos (Roles)

Control de acceso basado en roles (RBAC) granular con matriz dinámica de permisos.

### Casos de Uso:
- **`CreateRoleUseCase` / `UpdateRoleUseCase` / `DeleteRoleUseCase`**: Administración del catálogo de roles (con protección de roles de sistema como `SUPER_ADMIN`).
- **`GetPermissionsMatrixUseCase`**: Retorna la estructura completa de roles, catálogo de permisos y asignaciones actuales para la interfaz de administración.
- **`UpdateRolePermissionsUseCase`**: Asignación transaccional y atómica de permisos por rol.

---

## 6. Guía Técnica: Módulo de Auditoría (Audit)

Registra de forma inmutable las operaciones críticas del sistema (`LOGIN`, `LOGOUT`, `CREATE`, `UPDATE`, `DELETE`).

### Casos de Uso:
- **`CreateAuditLogUseCase`**: Invocado interna y transparentemente por el servicio de auditoría `AuditLogService` en cada operación de los Casos de Uso.
- **`ListAuditLogsUseCase`**: Consulta y filtrado de la bitácora con soporte para visualización de diffs JSON de los cambios efectuados.
