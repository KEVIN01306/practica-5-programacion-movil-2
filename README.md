# Sistema de Gestión y Control de Inventario

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Flutter](https://img.shields.io/badge/Flutter-3.13+-02569B?logo=flutter&logoColor=white)](https://flutter.dev/)
[![Dart](https://img.shields.io/badge/Dart-3.1+-0175C2?logo=dart&logoColor=white)](https://dart.dev/)

Solución integral multiplataforma para el control, trazabilidad y administración de existencias en tiempo real. Diseñado bajo los principios de **Clean Architecture**, **Domain-Driven Design (DDD)** y **Feature-Driven Modularization**, integrando escaneo óptico por cámara, generación de etiquetas con códigos de barras (Code 128) y códigos bidimensionales (QR), transacciones atómicas de stock y exportación directa de reportes a CSV.

---

## 📑 Tabla de Contenidos

- [1. Características Principales](#1-características-principales)
- [2. Arquitectura del Sistema](#2-arquitectura-del-sistema)
- [3. Requisitos del Sistema](#3-requisitos-del-sistema)
- [4. Guía de Instalación y Configuración](#4-guía-de-instalación-y-configuración)
  - [4.1. Clonar el Repositorio](#41-clonar-el-repositorio)
  - [4.2. Configuración y Despliegue del Backend](#42-configuración-y-despliegue-del-backend)
  - [4.3. Configuración y Ejecución del Frontend (Flutter)](#43-configuración-y-ejecución-del-frontend-flutter)
- [5. Credenciales por Defecto y Roles](#5-credenciales-por-defecto-y-roles)
- [6. Comandos de Verificación y Pruebas](#6-comandos-de-verificación-y-pruebas)
- [7. Documentación Técnica Complementaria](#7-documentación-técnica-complementaria)
- [8. Licencia](#8-licencia)

---

## 1. Características Principales

- **Control de Inventario en Tiempo Real**: Registro atómico de movimientos de entrada (`ENTRY`), salida (`EXIT`) y ajustes por conteo físico (`ADJUST`).
- **Control de Acceso Basado en Roles (RBAC)**:
  - `ADMIN`: Control total de usuarios, roles, catálogo, categorías y auditoría.
  - `OPERATOR`: Registro de movimientos, escaneo, consulta de existencias y alta rápida de categorías.
- **Códigos Únicos y Etiquetas Térmicas**: Algoritmo generador de identificadores anti-colisión y renderizado nativo en canvas de **Code 128** y **QR Code** (codificando exclusivamente el identificador de producto; la existencia se valida contra la base de datos).
- **Escáner Óptico Multiplataforma**: Integración de cámara en vivo con `mobile_scanner`, alternancia de linterna física, cambio de cámara trasera/frontal y visor con retícula láser animada.
- **Alertas y Filtro de Stock Bajo**: Notificaciones visuales en el panel principal y filtrado directo en base de datos (`currentStock <= minStock`).
- **Dashboard Financiero**: Métricas de existencias totales, conteo de catálogo y valoración económica del inventario ($existencias \times costPrice$).
- **Exportación Directa a CSV**: Generación de reportes inmediatos con descarga automática en disco mediante `CsvDownloader` multiplataforma (Web Blob / Desktop IO), sin necesidad de copiar manualmente texto.
- **Borrado Lógico**: Preservación de la integridad referencial histórica mediante `isActive: false`.

---

## 2. Arquitectura del Sistema

Tanto el backend como el cliente Flutter aplican **Clean Architecture** estructurada por módulos o **features** verticales:

```text
inventario/
├── backend/                     # API REST Node.js / Express / TypeScript / Prisma
│   ├── prisma/                  # Esquema relacional, migraciones y seeds
│   └── src/
│       ├── app/                 # Middlewares globales (Auth, Error, Zod) y HTTP Response
│       ├── routes/              # Enrutador centralizado (/api/v1)
│       ├── shared/              # Utilidades, proveedores de hashing y errores (AppError)
│       └── modules/             # Módulos verticales (Auth, Users, Categories, Products, StockMovements)
│           └── <Modulo>/
│               ├── domain/          # Entidades puras y contratos de repositorios
│               ├── application/     # Casos de uso y reglas de negocio
│               ├── infrastructure/  # Repositorios Prisma y mappers
│               └── presentation/    # Controladores Express y validadores Zod
│
├── frontend/                    # Cliente Multiplataforma Flutter / Dart
│   └── lib/
│       ├── core/                # Cliente de red (ApiClient), storage seguro y temas
│       ├── shared/              # Pintor de códigos (Code 128/QR), CsvDownloader, componentes UI
│       └── features/            # Módulos funcionales (auth, dashboard, categories, products, scanner, stock_movements)
│           └── <feature>/
│               ├── domain/          # Modelos y contratos de repositorio
│               ├── infrastructure/  # Implementación de llamadas HTTP
│               └── presentation/    # Vistas y widgets modulares desacoplados
│
└── docs/                        # Documentación técnica exhaustiva
    ├── ARCHITECTURE.md          # Especificación arquitectónica feature + domain
    ├── DATA_MODEL.md            # Esquema relacional, ERD y reglas de datos
    └── API_REFERENCE.md         # Catálogo completo de endpoints REST
```

---

## 3. Requisitos del Sistema

Antes de iniciar la instalación, asegúrate de contar con las siguientes herramientas instaladas:

| Herramienta | Versión Mínima Recomendada | Propósito |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.x LTS` | Entorno de ejecución para el Backend |
| **npm** | `>= 10.x` | Gestor de paquetes de Node.js |
| **PostgreSQL** | `>= 14.x` | Base de datos relacional |
| **Flutter SDK** | `>= 3.13.x` (Dart `>= 3.1.x`) | Framework cliente multiplataforma |
| **Git** | `>= 2.x` | Control de versiones |
| **Google Chrome / Chromium** | Última versión | Para depuración o ejecución web |

---

## 4. Guía de Instalación y Configuración

### 4.1. Clonar el Repositorio

```bash
git clone https://github.com/tu-organizacion/inventario.git
cd inventario
```

---

### 4.2. Configuración y Despliegue del Backend

1. **Acceder al directorio del backend e instalar dependencias:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar las variables de entorno:**
   Copia el archivo de ejemplo `.env.example` hacia `.env`:
   ```bash
   cp .env.example .env
   ```
   Abre `.env` y ajusta los valores según tu entorno local:
   ```env
   PORT=3000
   NODE_ENV=development

   # Conexión a PostgreSQL: postgresql://<USUARIO>:<PASSWORD>@<HOST>:<PUERTO>/<DATABASE>?schema=public
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventario?schema=public"

   # Clave secreta para firma de tokens JWT (puedes generarla con: openssl rand -base64 32)
   JWT_SECRET="super-secret-jwt-key-change-in-production-at-least-32-chars-long"
   JWT_ISS="inventario-api"
   JWT_AUD="inventario-clients"
   JWT_ACCESS_TTL="15m"
   JWT_REFRESH_TTL="7d"
   ```

3. **Ejecutar migraciones y semilla de base de datos:**
   Asegúrate de que el servicio de PostgreSQL esté en ejecución y ejecuta:
   ```bash
   # Genera las tablas e índices en PostgreSQL
   npm run db:migrate

   # Inserta los usuarios por defecto (Admin, Operador) y datos iniciales de prueba
   npm run db:seed
   ```

4. **Iniciar el servidor en modo desarrollo:**
   ```bash
   npm run dev
   ```
   El servidor arrancará en `http://localhost:3000`.

   *(Opcional: Si deseas compilar para producción)*
   ```bash
   npm run build
   npm start
   ```

5. **(Opcional) Explorador Visual de Base de Datos:**
   ```bash
   npm run db:studio
   ```
   Abre una interfaz gráfica web en `http://localhost:5555` para inspeccionar y administrar la base de datos en tiempo real.

---

### 4.3. Configuración y Ejecución del Frontend (Flutter)

1. **Acceder al directorio de Flutter y descargar paquetes:**
   ```bash
   cd ../frontend
   flutter pub get
   ```

2. **Configurar el endpoint del Backend:**
   El archivo `frontend/lib/core/constants/api_endpoints.dart` gestiona la URL base:
   - **Por defecto**: Conecta a la API en la nube (Render) o detecta el entorno.
   - **Para desarrollo local en la misma máquina**:
     - **Web o macOS Desktop**: `http://localhost:3000/api`
     - **Emulador Android**: `http://10.0.2.2:3000/api`
     - **Dispositivo móvil físico**: Usa la IP local de tu ordenador en la red Wi-Fi (ej. `http://192.168.1.50:3000/api`).

3. **Ejecutar en tu plataforma preferida:**

   - **En el Navegador Web (Google Chrome):**
     ```bash
     flutter run -d chrome
     ```

   - **En macOS Desktop:**
     ```bash
     flutter run -d macos
     ```

   - **En Emulador Android o Dispositivo Físico:**
     ```bash
     flutter devices
     flutter run -d <device-id>
     ```

   - **En Simulador iOS:**
     ```bash
     flutter run -d iPhone
     ```

---

## 5. Credenciales por Defecto y Roles

El comando `npm run db:seed` inicializa los siguientes usuarios en la base de datos:

| Rol | Correo Electrónico | Contraseña | Capacidades y Alcance |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@inventario.com` | `Admin1234*` | **Control total**: Gestión de usuarios, reactivación/desactivación, alta de productos con códigos manuales o generados, borrado lógico, creación y eliminación de categorías, registro de entradas, salidas y ajustes de stock, exportación de reportes. |
| **`OPERATOR`** | `operador@inventario.com` | `Operador1234*` | **Operativo de Almacén**: Consulta de catálogo, búsqueda y escaneo óptico por cámara de productos, registro de entradas/salidas/ajustes de existencias, alta ágil de categorías, consulta de historial y exportación a CSV. No puede alterar usuarios ni eliminar productos. |

---

## 6. Comandos de Verificación y Pruebas

Para garantizar que el código se mantenga libre de errores de tipado, sintaxis o regresiones:

### Backend:
```bash
cd backend

# Verificación de tipos TypeScript estricto
npm test
# (equivale a npx tsc --noEmit)
```

### Frontend (Flutter):
```bash
cd frontend

# Análisis estático de código Dart
flutter analyze

# Ejecución de pruebas unitarias
flutter test
```

---

## 7. Documentación Técnica Complementaria

Para profundizar en el diseño interno y manuales operativos del sistema, consulta los siguientes documentos en la carpeta [`docs/`](./docs/):

1. 📖 **[Manual de Usuario Oficial (`docs/MANUAL_DE_USUARIO.md`)](./docs/MANUAL_DE_USUARIO.md)**:
   - Manual completo para Operadores y Administradores listo para exportar a Word y PDF.
   - Guía de permisos, escáner óptico, kárdex, exportación CSV, generación de etiquetas y solución de errores comunes.

2. 🏛️ **[Arquitectura Técnica Feature + Domain (`docs/ARCHITECTURE.md`)](./docs/ARCHITECTURE.md)**:
   - Explicación detallada de las 4 capas de Clean Architecture.
   - Modularización por Features en Backend y Frontend Flutter.
   - Inyección de dependencias, desacoplamiento de componentes y diagramas de secuencia.
   - Ciclo de vida del escáner óptico y exportador CSV multiplataforma.

2. 🗄️ **[Modelo de Datos y Esquema de Base de Datos (`docs/DATA_MODEL.md`)](./docs/DATA_MODEL.md)**:
   - Diagrama Entidad-Relación (ERD) en Mermaid.
   - Diccionario de datos de todas las tablas: `users`, `user_sessions`, `categories`, `products`, `stock_movements`.
   - Índices, llaves foráneas, reglas de borrado lógico y transacciones atómicas.

3. 🌐 **[Referencia de la API REST (`docs/API_REFERENCE.md`)](./docs/API_REFERENCE.md)**:
   - Catálogo exhaustivo de endpoints bajo `/api/v1/`.
   - Esquemas de solicitud y respuesta, cabeceras JWT, query params de paginación y códigos de error estándar.

---

## 8. Licencia

Este proyecto está distribuido bajo la licencia **ISC**. Consulta los archivos de cada submódulo para más información.
