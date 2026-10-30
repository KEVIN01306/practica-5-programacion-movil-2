# MEMORY.md — Sistema de Inventario

## 1. Visión General del Proyecto
- **Proyecto**: Sistema de Gestión de Inventario (`inventario`).
- **Arquitectura**: Clean Architecture en Backend y Frontend.
- **Backend (`backend/`)**: Node.js, Express 5, TypeScript 5.9, Prisma ORM 6.19, PostgreSQL.
- **Frontend Principal (`frontend/`)**: Aplicación móvil/escritorio en Flutter (Dart) bajo Clean Architecture (`core/`, `shared/`, `modules/`).
- **Frontend Legado (`frontend_/`)**: Aplicación web React 19 + Vite (referencia para la migración a Flutter).

---

## 2. Base de Datos (PostgreSQL & Prisma)
Ubicación del esquema: `backend/prisma/schema.prisma`

### Enums
- `Role`:
  - `ADMIN`: Administrador con control total del sistema, usuarios y catálogo.
  - `OPERATOR`: Operador de bodega para registro de entradas, salidas y conteos físicos.
- `MovementType`:
  - `ENTRY`: Entrada de stock por compras o devoluciones.
  - `EXIT`: Salida de stock por ventas, mermas o descartes.
  - `ADJUST`: Ajuste por conteo físico / conciliación de inventario (requiere justificación en `notes`).

### Modelos de Datos
1. **`User` (`users`)**:
   - `id`: UUID (PK)
   - `email`: String (Unique)
   - `passwordHash`: String
   - `firstName`: String
   - `lastName`: String
   - `role`: Role (`ADMIN` | `OPERATOR`, default: `OPERATOR`)
   - `isActive`: Boolean (default: `true`, borrado lógico)
   - `createdAt`, `updatedAt`: DateTime
   - Relaciones: `sessions` (`UserSession[]`), `movements` (`StockMovement[]`)

2. **`UserSession` (`user_sessions`)**:
   - `id`: UUID (PK)
   - `userId`: String (FK -> `User.id`, Cascade)
   - `token`: String @unique @db.VarChar(500)
   - `expiresAt`: DateTime
   - `createdAt`: DateTime

3. **`Category` (`categories`)**:
   - `id`: UUID (PK)
   - `name`: String @unique
   - `description`: String?
   - `createdAt`, `updatedAt`: DateTime
   - Relaciones: `products` (`Product[]`)

4. **`Product` (`products`)**:
   - `id`: UUID (PK)
   - `code`: String @unique (Barcode Code 128 / QR)
   - `name`: String
   - `description`: String?
   - `costPrice`: Decimal(10, 2)
   - `salePrice`: Decimal(10, 2)
   - `currentStock`: Int (default: 0)
   - `minStock`: Int (default: 0)
   - `imageUrl`: String?
   - `isActive`: Boolean (default: `true`, borrado lógico)
   - `categoryId`: String (FK -> `Category.id`)
   - `createdAt`, `updatedAt`: DateTime
   - Relaciones: `category` (`Category`), `movements` (`StockMovement[]`)

5. **`StockMovement` (`stock_movements`)**:
   - `id`: UUID (PK)
   - `productId`: String (FK -> `Product.id`)
   - `type`: MovementType (`ENTRY` | `EXIT` | `ADJUST`)
   - `quantity`: Int
   - `previousStock`: Int
   - `resultingStock`: Int
   - `reason`: String
   - `notes`: String?
   - `userId`: String (FK -> `User.id`)
   - `createdAt`: DateTime

---

## 3. Catálogo de Endpoints de la API Backend (`backend/src/routes/index.routes.ts`)

Prefijo global: `/api/v1`

### 3.1. Autenticación (`/auth`)
- `POST /api/v1/auth/login`: Autenticación con email y contraseña. Retorna `accessToken`, `refreshToken` y objeto `user`.
- `POST /api/v1/auth/refresh`: Refresca token con cookie `refreshToken`.
- `POST /api/v1/auth/logout`: Invalida sesión (requiere Bearer token).
- `GET /api/v1/auth/me`: Retorna perfil del usuario en sesión (requiere Bearer token).

### 3.2. Usuarios (`/users`)
- `GET /api/v1/users/roles`: Retorna roles disponibles (`ADMIN`, `OPERATOR`).
- `PATCH /api/v1/users/me/password`: Cambio de contraseña personal del usuario autenticado.
- `GET /api/v1/users`: Listado paginado de usuarios (Solo `ADMIN`).
- `POST /api/v1/users`: Creación de usuario (Solo `ADMIN`).
- `PUT /api/v1/users/:id`: Actualización de datos de usuario (Solo `ADMIN`).
- `PATCH /api/v1/users/:id/activate`: Reactivación de usuario (Solo `ADMIN`).
- `PATCH /api/v1/users/:id/disable`: Desactivación de usuario (Solo `ADMIN`).
- `DELETE /api/v1/users/:id`: Borrado lógico de usuario (`isActive: false`) (Solo `ADMIN`).

### 3.3. Categorías (`/categories`)
- `GET /api/v1/categories`: Listado completo de categorías ordenadas por nombre.
- `GET /api/v1/categories/:id`: Detalle de una categoría por ID.
- `POST /api/v1/categories`: Creación de categoría (`ADMIN` y `OPERATOR`).
- `PUT /api/v1/categories/:id`: Modificación de categoría (Solo `ADMIN`).
- `DELETE /api/v1/categories/:id`: Eliminación física de categoría (Solo `ADMIN`).

### 3.4. Productos (`/products`)
- `GET /api/v1/products`: Listado paginado con filtros (`page`, `limit`, `search`, `categoryId`, `lowStock` con filtrado en base de datos `current_stock <= min_stock`).
- `GET /api/v1/products/generate-code`: Generación de código único garantizado anti-duplicados (ej. `PRD-X7K9M2`).
- `GET /api/v1/products/code/:code`: Búsqueda de producto por código de barras / QR.
- `GET /api/v1/products/:id`: Detalle de producto por ID.
- `GET /api/v1/products/:id/label`: Obtención de especificación de etiqueta escaneable (Code 128 + QR sólo con código único, plantilla de impresión HTML).
- `POST /api/v1/products`: Creación de producto con código único (Solo `ADMIN`).
- `PUT /api/v1/products/:id`: Edición de producto (Solo `ADMIN`).
- `DELETE /api/v1/products/:id`: Borrado lógico (`isActive: false`) (Solo `ADMIN`).

### 3.5. Movimientos de Stock (`/stock-movements`)
- `POST /api/v1/stock-movements`: Registro atómico de movimiento (`ENTRY`, `EXIT`, `ADJUST`). Actualiza automáticamente el stock actual del producto.
- `GET /api/v1/stock-movements`: Listado paginado de movimientos con filtros (`productId`, `type`, `startDate`, `endDate`).
- `GET /api/v1/stock-movements/product/:productId`: Historial cronológico de movimientos de un producto.

---

## 4. Estado de los Frontends
1. **Frontend Flutter (`frontend/`)**:
   - Estructurado bajo Clean Architecture utilizando la carpeta oficial **`features/`** (`frontend/lib/features/`):
     - `core/`:
       - `network/api_client.dart`: Cliente HTTP con inyección automática de cabecera `Authorization: Bearer <token>`, timeout y manejo de errores normalizado.
       - `storage/session_storage.dart`: Persistencia de sesión (token JWT, ID de usuario, rol y datos de perfil).
       - `constants/api_endpoints.dart`: Catálogo centralizado de URLs del backend con detección dinámica de host (Android `10.0.2.2` / iOS-Desktop `localhost`).
       - `theme/cupertino_theme.dart`: Apple Cupertino Design System (`CupertinoThemeData`, colores del sistema iOS).
     - `shared/`:
       - `widgets/barcode_widget.dart`: Generador y CustomPainter para código de barras Code 128 y código QR puro en canvas (codificando exclusivamente el código único).
       - `widgets/cupertino_components.dart`: Componentes Cupertino reutilizables (`CupertinoCard`, `CupertinoBadge`, `CupertinoStatCard`, `CupertinoLoadingState`, `CupertinoEmptyState`, diálogos de alerta y confirmación).
     - `features/auth/`:
       - `domain/`: Modelo `AuthUser`, enum `UserRole`, contrato `AuthRepository`.
       - `infrastructure/`: `AuthRepositoryImpl` conectando a `POST /api/v1/auth/login` y `POST /api/v1/auth/logout`.
       - `presentation/views/login_view.dart`: Login Cupertino con validación de correo (@ y dominio), alternancia de visibilidad de contraseña, indicador de carga y alertas de error.
     - `features/dashboard/`:
       - `domain/`: Modelo `DashboardMetrics` (productos activos, existencias totales, valoración económica $existencias \times costPrice$, alertas de stock bajo).
       - `infrastructure/`: `DashboardRepositoryImpl`.
       - `presentation/widgets/`: Separación modular en `dashboard_header.dart` (saludo + badge de rol), `dashboard_kpi_cards.dart` (2 columnas + valoración total), `quick_actions_grid.dart` (Escanear, Movimiento, Producto con tarjetas e iconos circulares), `low_stock_section.dart` (estado de stock con escudo verde "Al día" o lista de alertas).
       - `presentation/views/dashboard_view.dart`: Vista orquestadora liviana con pull-to-refresh y logout nativo.
     - `features/products/` y `features/categories/`:
       - `domain/`: Modelos `Product`, `Category`, contratos `ProductsRepository` y `CategoriesRepository` (con soporte para `createCategory`).
       - `infrastructure/`: Implementaciones que conectan con `/products` y `/categories` (`createCategory`, `getCategories`). Soporte para `generateProductCode()` y `getProductLabel()`.
       - `presentation/widgets/`: Separación modular en `product_card.dart` (thumbnail de 48x48 con soporte para `imageUrl`, `ClipRRect`, loader y fallback a icono), `product_search_bar.dart`, `product_label_card.dart` (renderizado Code 128 + QR puro), `product_options_sheet.dart`, y `category_form_modal.dart` (modal Cupertino para creación reactiva de categorías con validaciones y feedback de carga/error).
       - `presentation/views/`:
         - `ProductsListView`: Catálogo modular con buscador, filtros por categoría y stock bajo, acceso directo a la creación de categoría por botón en barra de navegación (`CupertinoIcons.tag_badge_plus`) y dentro del picker de categorías, menú contextual con verificación de movimientos históricos para bloqueo de eliminación física.
         - `ProductFormView`: Formulario Cupertino con botón "Generar Automático" con `CupertinoIcons.sparkles`, validación de código duplicado, stock inicial con trazabilidad y edición con stock bloqueado.
         - `ProductDetailView`: Ficha técnica, precios, renderizado de Code 128 y QR, exportación/impresión de etiqueta, y visualización de `imageUrl` en contenedor 80x80 con `ClipRRect` y fallback automático.
     - `features/scanner/`:
       - `presentation/widgets/`: `scanner_viewfinder.dart`, `scanner_reticle_painter.dart`, `scanner_action_sheets.dart`.
       - `presentation/views/scanner_view.dart`: Visor de cámara real con plugin `mobile_scanner`, renderizado del stream de video en vivo, detección automática de códigos (Code 128 / QR), control de linterna física (`toggleTorch`), alternador de cámara (`switchCamera`), retícula de escaneo con láser animado, búsqueda instantánea por código con rutas a Detalle/Movimiento, diálogo para códigos inexistentes, fallback de entrada manual y pantalla de error con reintento ante permisos denegados. Permisos de cámara configurados en Android (`AndroidManifest.xml`), iOS (`Info.plist`) y macOS (`Info.plist` + `.entitlements`).
     - `features/stock_movements/`:
       - `domain/`: Modelo `StockMovement`, enum `MovementType` (`ENTRY`, `EXIT`, `ADJUST`), contrato `StockMovementsRepository`.
       - `infrastructure/`: `StockMovementsRepositoryImpl`.
       - `presentation/widgets/`: `movement_item_card.dart`, `realtime_projection_card.dart`, `movement_type_selector.dart`.
       - `presentation/views/`:
         - `RegisterMovementView`: Selector tipo segmento modular Cupertino, cálculo en tiempo real de stock proyectado, validación estricta de existencias (bloquea salidas mayores a stock actual), justificación obligatoria en ajustes y diálogo de confirmación atómica.
         - `MovementsHistoryView`: Línea de tiempo cronológica modular de sólo lectura (inmutable), badges de color por tipo, filtros y exportación directa a CSV con descarga automática (nombre `<YYYY-MM-DD_HH-mm-ss>_<tipo_reporte>.csv`) usando `CsvDownloader`, sin modal de copiado manual y con menú `CupertinoActionSheet` protegido contra desbordamiento.
      - `shared/utils/csv_downloader.dart`:
        - Módulo para descarga directa multiplataforma (Web vía HTML Blob + anchor y Desktop/Nativo vía `dart:io` a `Downloads`) y formateo de nombre con timestamp.
     - `main.dart`: Navegación principal en `CupertinoTabScaffold` con 5 pestañas (Inicio, Catálogo, Escáner, Movimientos, Reportes) y compuerta de autenticación.
2. **Frontend React Legado (`frontend_/`)**:
   - Mantenido como referencia de UI y diseño para la migración hacia Flutter.

---

## 5. Historial de Cambios (Changelog)
- **2026-10-29 (Manual de Usuario Oficial para Exportación a Word/PDF)**:
  - Creación de `docs/MANUAL_DE_USUARIO.md` estructurado específicamente para conversión limpia a Microsoft Word y PDF.
  - Incluye: portada formal, índice, permisos de hardware (cámara y almacenamiento en iOS/Android/macOS/Web), gestión de roles (ADMIN vs OPERATOR), dashboard con KPIs y valoración económica, catálogo y categorías rápidas, escaneo óptico y generación de etiquetas Code 128 / QR (con la regla estricta de no codificar existencias), control de movimientos (entradas, salidas con bloqueo de sobregiro, ajustes con justificación obligatoria), kárdex cronológico y exportación directa a CSV con timestamp.
  - Tabla completa de errores comunes y soluciones paso a paso.
- **2026-10-29 (Documentación Técnica Completa y Guía de Instalación/Ejecución)**:
  - **README.md en Raíz**: Creado con instrucciones completas de instalación, configuración de `.env`, comandos de Prisma (`db:migrate`, `db:seed`, `db:studio`), credenciales por defecto (`admin@inventario.com`, `operador@inventario.com`), ejecución de backend y frontend en múltiples plataformas (Web, macOS, Android, iOS), y comandos de prueba.
  - **Configuración de Entorno**: Creado `backend/.env.example` con comentarios detallados de variables para PostgreSQL, JWT y puertos.
  - **Documentación Técnica en `docs/`**:
    - `docs/ARCHITECTURE.md`: Arquitectura Clean Architecture + Feature-Driven / Domain-Driven para Backend y Frontend, 4 capas, inyección de dependencias modular, desacoplamiento de vistas/widgets, diagramas Mermaid de autenticación, escáner, movimientos atómicos y exportación CSV.
    - `docs/DATA_MODEL.md`: Modelo de datos exhaustivo, diagrama ERD en Mermaid, especificación de tablas `users`, `user_sessions`, `categories`, `products`, `stock_movements`, tipos enum `Role` y `MovementType`, índices, soft-delete e integridad referencial.
    - `docs/API_REFERENCE.md`: Catálogo completo de endpoints REST `/api/v1/`, ejemplos de payload, query params, respuestas estandarizadas `ResponseHttp` y control de acceso por roles.
    - `docs/README.md`: Índice de navegación de la documentación técnica.
- **2026-10-29 (Descarga Directa de CSV, Menú Adaptativo, Filtro de Stock Bajo e ImageUrl en Catálogo)**:
  - **Exportación CSV en Reportes (`MovementsHistoryView`)**:
    - Reemplazo del modal de copiado manual por descarga directa de archivos CSV.
    - Generación de nombres de archivo dinámicos con fecha y hora: `<YYYY-MM-DD_HH-mm-ss>_<tipo_reporte>.csv` (`inventario_general` e `historial_movimientos`).
    - Creación de utilitario modular multiplataforma `CsvDownloader` (`shared/utils/csv_downloader.dart`) con soporte para Web (HTML Blob + ancla de descarga) y Desktop/Nativo (`dart:io` a carpeta `Downloads`).
    - Recorte de textos de acciones en `CupertinoActionSheetAction` y envoltura en `Flexible` con `TextOverflow.ellipsis` para erradicar cualquier desbordamiento de pantalla.
    - Test unitario creado en `frontend/test/csv_downloader_test.dart` (100% pasando).
  - **Filtro de Stock Bajo y Visualización de `imageUrl` en Catálogo**:
    - Implementación en Backend (`PrismaProductsRepository`) del filtro `lowStock` en base de datos mediante consulta SQL raw de IDs con `current_stock <= min_stock AND is_active = true`.
    - Garantía de filtrado estricto en frontend dentro de `ProductsController` ante el toggle reactivo de Stock Bajo.
    - Soporte completo de renderizado para `product.imageUrl` tanto en las tarjetas del catálogo (`ProductCard`, 48x48 con `ClipRRect(10.0)`) como en el detalle del producto (`ProductDetailView`, 80x80 con `ClipRRect(16.0)`), con loaders de actividad e iconos de fallback automáticos.
  - Verificación exitosa por el agente Tester: `npx tsc --noEmit` (0 errores), `flutter analyze` (0 errores) y pruebas unitarias passing.
- **2026-10-29 (Creación de Categoría en Catálogo y Backend)**:
  - Extensión de permisos en Backend para el endpoint `POST /api/v1/categories`, permitiendo acceso tanto a `ADMIN` como a `OPERATOR`.
  - Integración en `CategoriesRepository` y `CategoriesRepositoryImpl` de Flutter del método `createCategory({required String name, String? description})`.
  - Creación del widget modular Cupertino `CategoryFormModal` con campos de nombre, descripción, validación reactiva, loader y manejo de excepciones del API.
  - Integración en `ProductsListView` de botón de acceso a creación de categorías en la barra de navegación superior (`CupertinoIcons.tag_badge_plus`) y en la hoja de filtros de categoría.
  - Verificación exitosa por el agente Tester: `npx tsc --noEmit` (0 errores) y auditoría de Clean Architecture aprobada.
- **2026-10-29**:
  - Reemplazo del simulador estático de cámara en el módulo de escáner (`ScannerView`) por integración de cámara en vivo y lectura de códigos de barras (Code 128) y QR mediante `mobile_scanner`.
  - Configuración de permisos de hardware de cámara en Android (`android.permission.CAMERA`), iOS (`NSCameraUsageDescription`), y macOS (`com.apple.security.device.camera` + `NSCameraUsageDescription`).
  - Sincronización de controles de hardware en la interfaz Cupertino: alternancia de linterna física (`toggleTorch`), cambio de cámara trasera/frontal (`switchCamera`) y pausa/reanudación controlada del flujo al abrir las hojas de acción modal de producto.
  - Verificación exitosa de QA con `flutter analyze` (0 errores) y `npx tsc --noEmit` en backend (0 errores).
- **2026-10-28**:
  - Implementación en Backend de generación de códigos únicos de producto sin duplicados (`GET /api/v1/products/generate-code`) y servicio de etiquetas (`GET /api/v1/products/:id/label`).
  - Restricción estricta de codificación en etiquetas: el código identifica al producto; las existencias se consultan en base de datos; la cantidad disponible NO se codifica en el QR.
  - Corrección del renderizado de iconos en Flutter mediante la adición de `cupertino_icons: ^1.0.8` en `frontend/pubspec.yaml`, eliminando los glifos faltantes con cajas tachadas `[X]`.
  - Normalización de la nomenclatura de carpetas a `frontend/lib/features/`.
  - Desacoplamiento y modularización exhaustiva de la capa `presentation/` creando subdirectorios `widgets/` en todos los módulos (`dashboard/`, `products/`, `stock_movements/`, `scanner/`), evitando la sobrecarga en las vistas (`*_view.dart`).
  - Ajuste pixel-perfect de la pantalla de Inicio (Dashboard) replicando la maqueta de referencia: saludo con badge "ADMIN", tarjetas KPI ("Catálogo", "Existencias", "Valoración Económica Total Estimada"), accesos rápidos ("Escanear", "Movimiento", "Producto") y sección de alertas con indicador "Al día".
  - Verificación exitosa de QA con `flutter analyze` (0 errores) y compilación TypeScript en backend (0 errores).
