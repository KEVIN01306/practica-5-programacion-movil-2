# Referencia de la API REST (`/api/v1`)

Catálogo técnico detallado de los endpoints provistos por el Backend del Sistema de Inventario.

---

## 1. Convenciones Generales

### 1.1. URL Base
- **Desarrollo Local**: `http://localhost:3000/api/v1`
- **Emulador Android**: `http://10.0.2.2:3000/api/v1`
- **Producción (Render)**: `https://practica-5-programacion-movil-2.onrender.com/api/v1`

### 1.2. Cabeceras Obligatorias
Para endpoints protegidos:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### 1.3. Formato Estándar de Respuesta (`ResponseHttp`)

#### Respuesta Exitosa (200 / 201)
```json
{
  "success": true,
  "message": "Operación completada con éxito",
  "data": { ... }
}
```

#### Respuesta Paginada (200)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### Respuesta de Error (400 / 401 / 403 / 404 / 409 / 500)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Descripción clara del error de negocio o validación",
  "errors": [ ... ]
}
```

---

## 2. Autenticación (`/auth`)

### 2.1. Iniciar Sesión
- **Ruta**: `POST /api/v1/auth/login`
- **Autenticación**: Pública
- **Body**:
```json
{
  "email": "admin@inventario.com",
  "password": "Admin1234*"
}
```
- **Respuesta (200 OK)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "c71e21b0-...",
      "email": "admin@inventario.com",
      "firstName": "Admin",
      "lastName": "Sistema",
      "role": "ADMIN"
    }
  }
}
```

### 2.2. Refrescar Token
- **Ruta**: `POST /api/v1/auth/refresh`
- **Autenticación**: Pública (requiere cookie `refreshToken` o body con `{ "refreshToken": "..." }`)
- **Respuesta (200 OK)**: Nuevo `accessToken`.

### 2.3. Cerrar Sesión
- **Ruta**: `POST /api/v1/auth/logout`
- **Autenticación**: Bearer Token
- **Respuesta (200 OK)**: Invalida la sesión actual del usuario.

### 2.4. Obtener Perfil del Usuario Autenticado
- **Ruta**: `GET /api/v1/auth/me`
- **Autenticación**: Bearer Token
- **Respuesta (200 OK)**: Perfil completo del usuario en sesión.

---

## 3. Usuarios (`/users`)

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/roles` | `ADMIN`, `OPERATOR` | Retorna los roles disponibles (`ADMIN`, `OPERATOR`). |
| `PATCH`| `/api/v1/users/me/password` | `ADMIN`, `OPERATOR` | Cambio de contraseña del usuario autenticado. |
| `GET` | `/api/v1/users` | `ADMIN` | Listado paginado de usuarios del sistema. |
| `POST`| `/api/v1/users` | `ADMIN` | Alta de nuevo usuario (`role`, `email`, nombres). |
| `PUT` | `/api/v1/users/:id` | `ADMIN` | Actualización de perfil y rol de un usuario. |
| `PATCH`| `/api/v1/users/:id/activate` | `ADMIN` | Reactivación de usuario previamente desactivado. |
| `PATCH`| `/api/v1/users/:id/disable` | `ADMIN` | Desactivación de usuario. |
| `DELETE`| `/api/v1/users/:id` | `ADMIN` | Borrado lógico (`isActive: false`). |

---

## 4. Categorías (`/categories`)

### 4.1. Listar Categorías
- **Ruta**: `GET /api/v1/categories`
- **Autenticación**: Bearer Token (`ADMIN`, `OPERATOR`)
- **Respuesta (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "e82937ad-...",
      "name": "General",
      "description": "Categoría por defecto",
      "createdAt": "2026-10-28T18:00:00.000Z",
      "updatedAt": "2026-10-28T18:00:00.000Z"
    }
  ]
}
```

### 4.2. Crear Categoría
- **Ruta**: `POST /api/v1/categories`
- **Autenticación**: Bearer Token (`ADMIN`, `OPERATOR`)
- **Body**:
```json
{
  "name": "Herramientas Manuales",
  "description": "Equipos y accesorios de almacén"
}
```

### 4.3. Modificar Categoría
- **Ruta**: `PUT /api/v1/categories/:id`
- **Autenticación**: Bearer Token (Solo `ADMIN`)

### 4.4. Eliminar Categoría
- **Ruta**: `DELETE /api/v1/categories/:id`
- **Autenticación**: Bearer Token (Solo `ADMIN`)
- **Restricción**: Falla con `400 Bad Request` si la categoría posee productos vinculados.

---

## 5. Productos (`/products`)

### 5.1. Listar Productos (Paginado con Filtros)
- **Ruta**: `GET /api/v1/products`
- **Autenticación**: Bearer Token (`ADMIN`, `OPERATOR`)
- **Query Params**:
  - `page`: Número de página (default: `1`).
  - `limit`: Límite por página (default: `20`).
  - `search`: Búsqueda por nombre o código de producto.
  - `categoryId`: Filtrado por ID de categoría.
  - `lowStock`: Booleano (`true` filtra en BD `current_stock <= min_stock AND is_active = true`).

### 5.2. Generar Código Único Anti-Duplicados
- **Ruta**: `GET /api/v1/products/generate-code`
- **Autenticación**: Bearer Token (`ADMIN`, `OPERATOR`)
- **Respuesta (200 OK)**:
```json
{
  "success": true,
  "data": {
    "code": "PRD-M8Z9Q2"
  }
}
```

### 5.3. Buscar Producto por Código de Barras / QR
- **Ruta**: `GET /api/v1/products/code/:code`
- **Autenticación**: Bearer Token (`ADMIN`, `OPERATOR`)
- **Respuesta (200 OK)**: Objeto `Product` completo con su categoría asociada.

### 5.4. Obtener Etiqueta Escaneable del Producto
- **Ruta**: `GET /api/v1/products/:id/label`
- **Autenticación**: Bearer Token (`ADMIN`, `OPERATOR`)
- **Respuesta (200 OK)**: Especificaciones del código (Code 128 + QR puro) y plantilla de impresión en formato HTML listo para renderizado e impresión en impresora térmica.

### 5.5. Crear Producto
- **Ruta**: `POST /api/v1/products`
- **Autenticación**: Bearer Token (Solo `ADMIN`)
- **Body**:
```json
{
  "code": "PRD-M8Z9Q2",
  "name": "Taladro Percutor 1/2 pulgada",
  "description": "Taladro industrial de alta velocidad",
  "costPrice": 45.00,
  "salePrice": 65.50,
  "currentStock": 25,
  "minStock": 5,
  "categoryId": "e82937ad-...",
  "imageUrl": "https://pub-59913b0c53f044ad8a24e05f6a21ed2e.r2.dev/assets/taladro.png"
}
```

### 5.6. Editar Producto
- **Ruta**: `PUT /api/v1/products/:id`
- **Autenticación**: Bearer Token (Solo `ADMIN`)
- **Nota**: El stock no puede modificarse por este endpoint; las modificaciones de existencias se realizan estrictamente a través de `/stock-movements`.

### 5.7. Borrado Lógico de Producto
- **Ruta**: `DELETE /api/v1/products/:id`
- **Autenticación**: Bearer Token (Solo `ADMIN`)
- **Efecto**: Establece `isActive = false`, manteniendo el historial de movimientos intacto.

---

## 6. Movimientos de Stock (`/stock-movements`)

### 6.1. Registro Atómico de Movimiento
- **Ruta**: `POST /api/v1/stock-movements`
- **Autenticación**: Bearer Token (`ADMIN`, `OPERATOR`)
- **Body para Entrada (`ENTRY`)**:
```json
{
  "productId": "73c6838a-...",
  "type": "ENTRY",
  "quantity": 50,
  "reason": "Compra según factura F-9843",
  "notes": "Entrega por proveedor oficial"
}
```
- **Body para Salida (`EXIT`)**:
```json
{
  "productId": "73c6838a-...",
  "type": "EXIT",
  "quantity": 10,
  "reason": "Despacho a sucursal norte"
}
```
- **Body para Ajuste / Conteo Físico (`ADJUST`)**:
```json
{
  "productId": "73c6838a-...",
  "type": "ADJUST",
  "quantity": 42,
  "reason": "Conteo físico semestral",
  "notes": "Se encontraron 8 unidades dañadas en bodega no reportadas"
}
```
- **Respuesta (201 Created)**:
```json
{
  "success": true,
  "message": "Movimiento registrado exitosamente",
  "data": {
    "id": "184b80e4-...",
    "productId": "73c6838a-...",
    "type": "ENTRY",
    "quantity": 50,
    "previousStock": 25,
    "resultingStock": 75,
    "reason": "Compra según factura F-9843",
    "notes": "Entrega por proveedor oficial",
    "userId": "c71e21b0-...",
    "createdAt": "2026-10-29T21:40:00.000Z"
  }
}
```

### 6.2. Listar Historial de Movimientos (Paginado)
- **Ruta**: `GET /api/v1/stock-movements`
- **Autenticación**: Bearer Token (`ADMIN`, `OPERATOR`)
- **Query Params**:
  - `page`: Número de página.
  - `limit`: Cantidad por página.
  - `productId`: Filtra movimientos de un producto particular.
  - `type`: Filtra por tipo (`ENTRY`, `EXIT`, `ADJUST`).
  - `startDate`: Filtro ISO8601 inicial.
  - `endDate`: Filtro ISO8601 final.

### 6.3. Historial de un Producto Específico
- **Ruta**: `GET /api/v1/stock-movements/product/:productId`
- **Autenticación**: Bearer Token (`ADMIN`, `OPERATOR`)
- **Respuesta (200 OK)**: Lista cronológica inmutable con las transacciones de existencias de dicho producto.
