# Documentación Técnica y Manuales del Sistema de Inventario

Índice central de la documentación técnica, arquitectónica y manuales de usuario del proyecto:

1. **[Manual de Usuario del Sistema (`MANUAL_DE_USUARIO.md`)](./MANUAL_DE_USUARIO.md)**:
   - Guía oficial de uso para Administradores y Operadores de bodega lista para exportar a Word/PDF.
   - Instrucciones de instalación y permisos (cámara y almacenamiento).
   - Gestión de productos, categorías y alertas de stock bajo.
   - Generación y lectura de etiquetas (Code 128 / QR) con escáner de cámara.
   - Entradas, salidas, ajustes de inventario con control de sobregiro y justificación obligatoria.
   - Historial de movimientos y exportación directa a CSV.
   - Tabla de resolución de errores comunes.

2. **[Arquitectura Técnica Feature + Domain (`ARCHITECTURE.md`)](./ARCHITECTURE.md)**:
   - Principios de Clean Architecture, Screaming Architecture y DDD.
   - Desglose de capas en Backend (`domain`, `application`, `infrastructure`, `presentation`).
   - Desglose de capas en Frontend Flutter (`core`, `shared`, `features/<feature>/{domain, infrastructure, presentation}`).
   - Diagramas de secuencia para autenticación, generación de códigos/etiquetas, registro atómico de movimientos y exportación CSV.

2. **[Modelo de Datos y Persistencia (`DATA_MODEL.md`)](./DATA_MODEL.md)**:
   - Diagrama Entidad-Relación (ERD) en Mermaid.
   - Modelos: `User`, `UserSession`, `Category`, `Product`, `StockMovement`.
   - Enums: `Role` (`ADMIN`, `OPERATOR`), `MovementType` (`ENTRY`, `EXIT`, `ADJUST`).
   - Reglas de integridad referencial, transacciones atómicas e indexación.

3. **[Referencia de la API REST (`API_REFERENCE.md`)](./API_REFERENCE.md)**:
   - Prefijo `/api/v1`.
   - Módulos de la API: `/auth`, `/users`, `/categories`, `/products`, `/stock-movements`.
   - Formatos estandarizados de respuestas exitosas, paginadas y de error.
