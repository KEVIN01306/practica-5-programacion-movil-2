# MANUAL DE USUARIO
## Sistema de Gestión y Control de Inventario
### Versión 1.0 — Guía Oficial de Operación y Administración

---

> **Nota para la exportación a PDF / Microsoft Word:**  
> Este documento está diseñado con saltos de sección, tablas estructuradas, cuadros de advertencia y descriptores de capturas de pantalla para facilitar su conversión a documento Word (.docx) o impresión en PDF.

---

## 📑 Contenido del Manual

1. [Introducción y Objetivos del Sistema](#1-introducción-y-objetivos-del-sistema)
2. [Instalación, Requisitos y Permisos](#2-instalación-requisitos-y-permisos)
   - [2.1. Permisos del Dispositivo (Cámara y Almacenamiento)](#21-permisos-del-dispositivo-cámara-y-almacenamiento)
   - [2.2. Conexión con el Servidor Central](#22-conexión-con-el-servidor-central)
3. [Control de Acceso y Perfiles de Usuario](#3-control-de-acceso-y-perfiles-de-usuario)
   - [3.1. Inicio de Sesión](#31-inicio-de-sesión)
   - [3.2. Roles del Sistema: Administrador vs. Operador](#32-roles-del-sistema-administrador-vs-operador)
   - [3.3. Cambio de Contraseña y Cierre de Sesión](#33-cambio-de-contraseña-y-cierre-de-sesión)
4. [Pantalla Principal (Dashboard) y Alertas de Stock](#4-pantalla-principal-dashboard-y-alertas-de-stock)
   - [4.1. Indicadores Clave de Desempeño (KPIs)](#41-indicadores-clave-de-desempeño-kpis)
   - [4.2. Valoración Económica del Inventario](#42-valoración-económica-del-inventario)
   - [4.3. Monitor de Alertas de Stock Bajo](#43-monitor-de-alertas-de-stock-bajo)
   - [4.4. Accesos Rápidos](#44-accesos-rápidos)
5. [Gestión del Catálogo y Categorías](#5-gestión-del-catálogo-y-categorías)
   - [5.1. Consulta y Búsqueda de Productos](#51-consulta-y-búsqueda-de-productos)
   - [5.2. Filtrado por Categoría y por Alerta de Stock Bajo](#52-filtrado-por-categoría-y-por-alerta-de-stock-bajo)
   - [5.3. Creación Rápida de Categorías](#53-creación-rápida-de-categorías)
   - [5.4. Registro de Nuevos Productos](#54-registro-de-nuevos-productos)
   - [5.5. Ficha Técnica, Modificación y Baja Lógica](#55-ficha-técnica-modificación-y-baja-lógica)
6. [Generación y Lectura de Etiquetas (Código de Barras y QR)](#6-generación-y-lectura-de-etiquetas-código-de-barras-y-qr)
   - [6.1. Visualización e Impresión de Etiquetas](#61-visualización-e-impresión-de-etiquetas)
   - [6.2. Regla Fundamental de Codificación en Etiquetas](#62-regla-fundamental-de-codificación-en-etiquetas)
   - [6.3. Uso del Escáner Óptico de Cámara](#63-uso-del-escáner-óptico-de-cámara)
7. [Entradas, Salidas y Ajustes de Stock](#7-entradas-salidas-y-ajustes-de-stock)
   - [7.1. Registro de Entrada de Mercancía (`ENTRY`)](#71-registro-de-entrada-de-mercancía-entry)
   - [7.2. Registro de Salida de Mercancía (`EXIT`) y Control de Sobregiro](#72-registro-de-salida-de-mercancía-exit-y-control-de-sobregiro)
   - [7.3. Ajuste por Conteo Físico (`ADJUST`) y Justificación Obligatoria](#73-ajuste-por-conteo-físico-adjust-y-justificación-obligatoria)
   - [7.4. Proyección Dinámica y Confirmación Segura](#74-proyección-dinámica-y-confirmación-segura)
8. [Historial, Trazabilidad y Exportación a CSV](#8-historial-trazabilidad-y-exportación-a-csv)
   - [8.1. Consulta Cronológica del Kárdex de Movimientos](#81-consulta-cronológica-del-kárdex-de-movimientos)
   - [8.2. Exportación Directa de Reportes en Archivo CSV](#82-exportación-directa-de-reportes-en-archivo-csv)
   - [8.3. Apertura de Reportes en Excel / Hojas de Cálculo](#83-apertura-de-reportes-en-excel--hojas-de-cálculo)
9. [Guía de Resolución de Errores Comunes](#9-guía-de-resolución-de-errores-comunes)

---

## 1. Introducción y Objetivos del Sistema

El **Sistema de Gestión y Control de Inventario** es una solución diseñada para optimizar los procesos de recepción, almacenamiento, despacho y auditoría de mercancías. 

Su interfaz sigue la guía visual de Apple Cupertino (iOS/macOS), ofreciendo una experiencia fluida, rápida e intuitiva para teléfonos inteligentes, tablets y computadoras de escritorio.

### Principales Beneficios:
- **Trazabilidad 100% Inmutable:** Cada cambio de existencias queda registrado con fecha, hora, responsable y motivo.
- **Cero Errores Manuales:** Búsqueda y selección de artículos mediante escaneo directo de códigos **Code 128** y códigos **QR**.
- **Control Antideterioro y Sobregiro:** El sistema impide despachar o dar salida a productos si la cantidad solicitada supera las existencias disponibles en almacén.
- **Acceso Inmediato a Datos:** Exportación de kárdex e inventario consolidado a formato CSV descargable con un solo clic.

---

## 2. Instalación, Requisitos y Permisos

La aplicación puede ejecutarse desde navegadores modernos (Google Chrome, Safari, Edge), computadoras con macOS o terminales móviles Android e iOS.

### 2.1. Permisos del Dispositivo (Cámara y Almacenamiento)

Para aprovechar todas las funciones de la aplicación en dispositivos móviles y portátiles, el sistema operativo solicitará los siguientes permisos en el primer uso:

```
┌───────────────────────────────────────────────────────────────┐
│                    PERMISOS REQUERIDOS                        │
├───────────────────────┬───────────────────────────────────────┤
│ Permiso               │ Justificación                         │
├───────────────────────┼───────────────────────────────────────┤
│ Cámara de Video       │ Necesario para leer códigos de barra  │
│ (mobile_scanner)      │ Code 128 y códigos QR en tiempo real  │
├───────────────────────┼───────────────────────────────────────┤
│ Almacenamiento /      │ Necesario para guardar las descargas  │
│ Archivos Locales      │ directas de reportes en formato CSV   │
└───────────────────────┴───────────────────────────────────────┘
```

> 📸 **[Captura de pantalla recomendada: Diálogo nativo del sistema operativo solicitando acceso a la cámara y al almacenamiento]**  
> *Ejemplo: Cuadro de diálogo del sistema mostrando "«Inventario» desea acceder a la cámara de este dispositivo".*

#### ¿Cómo otorgar o restablecer permisos si fueron denegados por error?
- **En Android:** Ir a `Ajustes` > `Aplicaciones` > `Inventario` > `Permisos` > Activar **Cámara**.
- **En iOS / iPadOS:** Ir a `Configuración` > Deslizar hacia abajo hasta `Inventario` > Activar el interruptor **Cámara**.
- **En macOS:** Ir a `Preferencias del Sistema` > `Privacidad y Seguridad` > `Cámara` > Asegurar que la casilla de la aplicación esté marcada.
- **En Navegador Web (Chrome/Safari):** Hacer clic en el icono de candado o controles del sitio junto a la barra de direcciones y seleccionar **"Permitir Cámara"**.

### 2.2. Conexión con el Servidor Central

La aplicación requiere conexión a la red local (Wi-Fi) o a Internet para sincronizar existencias en tiempo real con el servidor de base de datos.
- Si no hay conexión o el servidor está en mantenimiento, la aplicación mostrará una alerta clara indicando **"Error de conexión con el servidor"**, evitando operaciones inconsistentes.

---

## 3. Control de Acceso y Perfiles de Usuario

### 3.1. Inicio de Sesión

1. Al abrir la aplicación, se presenta la pantalla de autenticación con el logotipo corporativo.
2. Ingrese su **Correo electrónico institucional** y su **Contraseña**.
3. Puede presionar el icono del ojo junto al campo de contraseña para verificar el texto ingresado.
4. Presione el botón azul **"Iniciar Sesión"**.

> 📸 **[Captura de pantalla recomendada: Pantalla de Login mostrando los campos de correo, contraseña, botón de visibilidad y botón de acción]**

### 3.2. Roles del Sistema: Administrador vs. Operador

El sistema cuenta con dos niveles de acceso según el puesto del colaborador:

| Función / Operación | Administrador (`ADMIN`) | Operador (`OPERATOR`) |
| :--- | :---: | :---: |
| Consultar Dashboard y Valoración Total | ✅ Sí | ✅ Sí |
| Buscar productos en el catálogo | ✅ Sí | ✅ Sí |
| Escanear códigos con la cámara | ✅ Sí | ✅ Sí |
| Crear categorías de productos | ✅ Sí | ✅ Sí |
| Registrar Entradas de Stock (`ENTRY`) | ✅ Sí | ✅ Sí |
| Registrar Salidas de Stock (`EXIT`) | ✅ Sí | ✅ Sí |
| Registrar Ajustes por Conteo Físico (`ADJUST`) | ✅ Sí | ✅ Sí |
| Consultar y descargar reportes en CSV | ✅ Sí | ✅ Sí |
| Crear nuevos productos en el catálogo | ✅ Sí | ❌ Bloqueado |
| Modificar datos base de un producto | ✅ Sí | ❌ Bloqueado |
| Dar de baja lógica a un producto (`isActive`) | ✅ Sí | ❌ Bloqueado |
| Crear o gestionar usuarios del sistema | ✅ Sí | ❌ Bloqueado |

> 💡 **Nota de Seguridad:** Cuando un usuario con rol `OPERATOR` ingresa al sistema, las opciones administrativas como "Crear Producto", "Editar Producto" o "Eliminar Producto" no se muestran o aparecen deshabilitadas con un aviso de permisos insuficientes.

### 3.3. Cambio de Contraseña y Cierre de Sesión

- **Cerrar Sesión:** En la esquina superior derecha del Dashboard o en la pestaña de perfil, presione el botón de salida (icono de puerta o flecha). Se invalidará la sesión y se protegerán los datos del dispositivo.
- **Cambio de Contraseña:** Disponible en la sección de usuario, solicitando ingresar la contraseña actual y la nueva contraseña confirmada.

---

## 4. Pantalla Principal (Dashboard) y Alertas de Stock

Al autenticarse, el sistema presenta el panel general de control:

> 📸 **[Captura de pantalla recomendada: Vista completa del Dashboard en iOS/macOS con el saludo al usuario, badge de rol, las 3 tarjetas de KPIs, accesos rápidos y sección de alertas]**

### 4.1. Indicadores Clave de Desempeño (KPIs)

En la parte superior se muestran dos tarjetas informativas rápidas:
1. **Catálogo:** Cantidad total de productos registrados activos en el sistema.
2. **Existencias:** Sumatoria de todas las unidades físicas disponibles en bodega.

### 4.2. Valoración Económica del Inventario

Debajo de las existencias se ubica una tarjeta destacada con el indicador:
$$\text{Valoración Total} = \sum (\text{Stock Actual} \times \text{Precio de Costo})$$
Este valor refleja la inversión monetaria inmovilizada en almacén a costo de reposición.

### 4.3. Monitor de Alertas de Stock Bajo

El sistema vigila constantemente el nivel de existencias contra el umbral mínimo fijado para cada producto:
- **Si todo el inventario está abastecido:** Aparece un distintivo verde con el mensaje **"Al día: No hay productos con existencias críticas"**.
- **Si uno o más productos tienen existencias iguales o inferiores a su mínimo:** Se despliega una lista de alerta de color ámbar/rojo con el nombre del producto, stock actual en color rojo y el stock mínimo sugerido para reposición inmediata.

### 4.4. Accesos Rápidos

Tres botones centrales permiten acceder a las operaciones cotidianas:
1. **Escanear:** Abre inmediatamente la cámara para identificar un artículo por código.
2. **Movimiento:** Conduce al formulario de registro de entradas, salidas o ajustes.
3. **Producto:** Acceso directo al catálogo general o alta de productos (según rol).

---

## 5. Gestión del Catálogo y Categorías

Acceda a esta sección desde la pestaña inferior **"Catálogo"**.

> 📸 **[Captura de pantalla recomendada: Pantalla de Lista de Productos con buscador, selector de categorías, switch de Stock Bajo y lista de tarjetas]**

### 5.1. Consulta y Búsqueda de Productos

- **Buscador en Vivo:** Escriba cualquier fragmento del nombre o el código del producto en la barra superior. La lista se filtrará en tiempo real.
- **Tarjetas de Producto:** Cada artículo muestra su fotografía (con fallback a icono si no tiene imagen), nombre, categoría, código único, precio de venta y existencia actual.

### 5.2. Filtrado por Categoría y por Alerta de Stock Bajo

- **Selector de Categorías:** Permite acotar los productos a un departamento específico (ej. "General", "Herramientas", "Lácteos").
- **Interruptor "Stock Bajo":** Al activar este control, el catálogo oculta los productos con existencias normales y muestra **únicamente aquellos con existencias en nivel de alerta o agotados**.

### 5.3. Creación Rápida de Categorías

Tanto los Administradores como los Operadores pueden dar de alta nuevas categorías sin salir del catálogo:
1. Presione el botón con el icono de etiqueta con signo más (`+`) en la barra superior o dentro del selector de categorías.
2. Se desplegará el modal **"Nueva Categoría"**.
3. Ingrese el **Nombre** (obligatorio) y una **Descripción** (opcional).
4. Presione **"Guardar Categoría"**. La categoría queda disponible inmediatamente para clasificar productos.

> 📸 **[Captura de pantalla recomendada: Modal emergente Cupertino para creación de categoría]**

### 5.4. Registro de Nuevos Productos *(Solo Administradores)*

1. En la pestaña Catálogo, presione el botón `+` en la esquina superior.
2. Se abrirá el formulario de alta de producto.
3. **Código del Producto:**
   - Puede escribir un código manual (ej. código de barras comercial EAN-13 del empaque).
   - O puede presionar el botón **"Generar Automático"** (icono de destello). El sistema creará un código único garantizado anti-duplicados (ej. `PRD-X7K9M2`).
4. **Campos Requeridos:**
   - **Nombre:** Denominación clara del artículo.
   - **Categoría:** Seleccione la categoría perteneciente.
   - **Precio de Costo:** Costo de compra unitario.
   - **Precio de Venta:** Precio sugerido de venta al público.
   - **Stock Inicial:** Cantidad física existente al momento del alta (generará su movimiento de apertura).
   - **Stock Mínimo:** Nivel umbral que detonará alertas de reposición.
   - **URL de Imagen (Opcional):** Enlace web a la fotografía del producto.
5. Presione **"Guardar Producto"**.

> 📸 **[Captura de pantalla recomendada: Formulario de creación de producto mostrando el botón de código automático y los campos de precios/stock]**

### 5.5. Ficha Técnica, Modificación y Baja Lógica

Al tocar cualquier producto de la lista se accede a su **Ficha Detallada**:
- Permite ver precios, existencias, alertas, descripción y la etiqueta escaneable.
- **Editar:** Permite actualizar nombres, descripción, precios o imagen.  
  *(Nota: El stock no se edita aquí para evitar fraudes; se modifica registrando movimientos).*
- **Baja Lógica (Eliminar):** El Administrador puede dar de baja un producto. El producto se oculta del catálogo activo pero sus movimientos históricos de bodega se conservan intactos para auditoría.

---

## 6. Generación y Lectura de Etiquetas (Código de Barras y QR)

### 6.1. Visualización e Impresión de Etiquetas

Dentro del detalle de cada producto se encuentra la sección **"Etiqueta de Identificación"**:
- **Código de Barras Lineal (Code 128):** Para lectores láser de mano tipo pistola o lectores de caja registradora.
- **Código Bidimensional (QR Code):** Para escaneo omnidireccional con cámaras de teléfonos inteligentes o tablets.
- **Opción de Impresión:** Al presionar **"Imprimir Etiqueta"**, el sistema genera una plantilla optimizada lista para impresoras térmicas de etiquetas adhesivas.

> 📸 **[Captura de pantalla recomendada: Ficha de producto mostrando la renderización nítida del Code 128 y del QR junto al botón de imprimir]**

### 6.2. Regla Fundamental de Codificación en Etiquetas

> ⚠️ **REGLA DE ORO DEL SISTEMA:**  
> **El código impreso en la etiqueta (tanto el Code 128 como el QR) contiene ÚNICAMENTE el código único del producto (ej. `PRD-X7K9M2`).**  
> **NUNCA se imprime la cantidad de stock en la etiqueta física**, debido a que el stock cambia constantemente con las ventas y compras. Al escanear el código, el sistema consulta en tiempo real las existencias verdaderas en la base de datos central.

### 6.3. Uso del Escáner Óptico de Cámara

Acceda a la pestaña **"Escáner"** en el menú inferior:
1. Apunte la cámara de su dispositivo hacia la etiqueta del producto.
2. Alinee el código de barras o QR dentro del cuadro central con guía láser animada.
3. **Controles Disponibles en Pantalla:**
   - 💡 **Linterna (Flash):** Presione el botón de bombilla para encender la luz del dispositivo en almacenes oscuros o con poca iluminación.
   - 🔄 **Cambio de Cámara:** Alterna entre la cámara trasera principal y la cámara frontal.
   - ⌨️ **Entrada Manual:** Si una etiqueta está sucia o rota físicamente, presione "Ingresar Código Manual" para escribir los caracteres a mano.
4. Al detectar el código, la aplicación emitirá una respuesta instantánea y abrirá una hoja de opciones:
   - **Ver Detalle del Producto**
   - **Registrar Movimiento de Stock Directo**

> 📸 **[Captura de pantalla recomendada: Visor del escáner en funcionamiento con el recuadro de enfoque, botón de flash y diálogo inferior de acciones]**

---

## 7. Entradas, Salidas y Ajustes de Stock

Acceda a esta función desde la pestaña **"Movimientos"** o tocando **"Registrar Movimiento"** tras escanear un producto.

> 📸 **[Captura de pantalla recomendada: Formulario de Registro de Movimiento con el selector tipo segmento (Entrada, Salida, Ajuste), cálculo de proyección y campo de notas]**

### 7.1. Registro de Entrada de Mercancía (`ENTRY`)

Se utiliza para ingresar productos al almacén por compras a proveedores, traspasos entre sucursales o devoluciones de clientes.
1. Seleccione el producto correspondiente.
2. En el selector superior, seleccione la opción verde **"Entrada"**.
3. Ingrese la **Cantidad a Ingresar** (número entero positivo, ej. `50`).
4. Ingrese el **Motivo** (ej. "Factura Proveedor F-4920").
5. Verifique la tarjeta de **Stock Proyectado**: mostrará el stock previo, la suma y la cantidad resultante final.
6. Presione **"Confirmar Movimiento"**.

### 7.2. Registro de Salida de Mercancía (`EXIT`) y Control de Sobregiro

Se utiliza para registrar despachos por ventas, entregas o mermas por vencimiento/daño.
1. Seleccione el producto.
2. En el selector, elija la opción naranja **"Salida"**.
3. Ingrese la **Cantidad a Retirar**.
4. Ingrese el **Motivo** (ej. "Nota de Venta NV-102").
5. **Control de Sobregiro Automático:**  
   Si intenta retirar una cantidad mayor al stock disponible (por ejemplo, retirar 15 unidades cuando solo hay 10 en almacén), el sistema **bloqueará inmediatamente el botón de confirmación**, alertando en color rojo:  
   *`"Existencias insuficientes: La cantidad supera el stock actual."`*
6. Ingrese una cantidad válida y confirme la operación.

### 7.3. Ajuste por Conteo Físico (`ADJUST`) y Justificación Obligatoria

Se utiliza durante auditorías periódicas o conteos cíclicos de almacén para conciliar el sistema con la realidad física.
1. En el selector, elija la opción azul **"Ajuste"**.
2. **Cantidad Resultante:** Ingrese el conteo físico exacto que contó con sus manos en la estantería (ej. si el sistema dice que hay 20 pero contó 18, ingrese `18`).
3. El sistema calculará automáticamente la diferencia (+ o -).
4. **Justificación Obligatoria:** En los ajustes es **estrictamente obligatorio llenar el campo "Notas / Justificación"** (ej. *"Se encontraron 2 unidades rotas en la tarima 4"*). Si el campo está vacío, la operación no se procesará.
5. Presione **"Confirmar Ajuste"**.

### 7.4. Proyección Dinámica y Confirmación Segura

Antes de guardar cualquier transacción, el sistema presenta un diálogo de confirmación modal que resume la operación:
- *Producto:* Taladro Percutor
- *Operación:* Salida de 5 unidades
- *Stock resultante:* 20 unidades
Al presionar **"Aceptar"**, la transacción se guarda de forma atómica en el servidor.

---

## 8. Historial, Trazabilidad y Exportación a CSV

Acceda a la pestaña **"Historial"** o **"Reportes"**.

> 📸 **[Captura de pantalla recomendada: Vista del Historial de Movimientos con las tarjetas cronológicas, badges de color y botón superior de exportar a CSV]**

### 8.1. Consulta Cronológica del Kárdex de Movimientos

- Lista inmutable ordenada desde el movimiento más reciente al más antiguo.
- Cada tarjeta contiene:
  - Distintivo visual: `[ENTRADA]` (verde), `[SALIDA]` (naranja), `[AJUSTE]` (azul).
  - Fecha y hora exacta del registro.
  - Nombre y código del producto.
  - Cantidad operada y transición de existencias: `Stock Previo ──> Stock Resultante`.
  - Motivo, notas justificativas y nombre del colaborador responsable.

### 8.2. Exportación Directa de Reportes en Archivo CSV

La aplicación cuenta con un módulo de descarga directa de reportes que genera archivos estructurados compatibles con hojas de cálculo:
1. En la esquina superior derecha del historial, presione el botón de exportación (icono de compartir o bandeja con flecha hacia abajo).
2. Se desplegará un menú de opciones con dos tipos de reporte:
   - **Reporte General de Catálogo e Inventario:** Lista todos los productos, categorías, costos, precios, existencias actuales y estado de stock bajo.
   - **Historial Completo de Movimientos (Kárdex):** Exporta todas las transacciones históricas registradas.
3. Al seleccionar la opción deseada, el archivo se descargará **automáticamente** a su dispositivo:
   - **En Computadora (macOS / Windows / Web):** El archivo se guardará en su carpeta de `Descargas` (`Downloads`).
   - **En Móvil (Android / iOS):** Se descargará en el gestor de archivos o se abrirá el selector nativo para guardar o compartir por correo/WhatsApp.
4. **Nomenclatura Automática del Archivo:**  
   Los archivos se nombran con marca temporal para evitar que se sobrescriban entre sí:  
   `YYYY-MM-DD_HH-mm-ss_inventario_general.csv`  
   `YYYY-MM-DD_HH-mm-ss_historial_movimientos.csv`

### 8.3. Apertura de Reportes en Excel / Hojas de Cálculo

Los archivos generados utilizan codificación universal **UTF-8 con BOM** y delimitación por comas, lo que garantiza que:
- Los acentos, caracteres especiales y letras "ñ" se visualicen correctamente sin configuraciones previas.
- Pueda hacer doble clic directamente sobre el archivo para abrirlo de inmediato en **Microsoft Excel**, **Apple Numbers**, **Google Sheets** o **LibreOffice Calc**.

---

## 9. Guía de Resolución de Errores Comunes

A continuación se listan las situaciones o mensajes de error más comunes y los pasos concretos para solucionarlos:

| Mensaje de Error en Pantalla | Causa Probable | Solución Paso a Paso |
| :--- | :--- | :--- |
| **"Credenciales inválidas"** | El correo electrónico o la contraseña ingresada no coinciden con los registros. | Verifique que no haya espacios al inicio o al final del correo. Asegúrese de que las mayúsculas y caracteres especiales de la contraseña sean correctos. Si olvidó su clave, solicite a un Administrador que la restablezca. |
| **"Permiso de cámara no concedido"** | El sistema operativo denegó el acceso de la aplicación a la cámara física. | Presione el botón "Reintentar Permisos" en pantalla o diríjase a los Ajustes de Privacidad de su dispositivo y habilite el permiso de Cámara para la aplicación (ver sección 2.1 de este manual). |
| **"Producto no encontrado"** | El código de barras o QR escaneado no corresponde a ningún producto activo en almacén. | 1. Verifique que la etiqueta no esté sucia o deteriorada.<br>2. Verifique si el producto está registrado en el Catálogo.<br>3. Si es un producto nuevo, solicite al Administrador registrarlo antes de intentar escanearlo. |
| **"Existencias insuficientes"** | Se intentó realizar una Salida (`EXIT`) por una cantidad superior al stock que existe físicamente en el sistema. | El sistema protege la integridad del almacén impidiendo existencias negativas. Verifique el stock disponible en la ficha del producto. Si hay mercancía física que no está en sistema, registre primero la Entrada correspondiente o realice un Conteo Físico (`ADJUST`). |
| **"La justificación es obligatoria"** | Se intentó registrar un Ajuste de inventario (`ADJUST`) dejando el campo "Notas / Justificación" en blanco. | Todo ajuste por auditoría requiere trazabilidad. Ingrese una breve explicación de la diferencia (ej. "Conteo físico semestral", "Producto quebrado en pasillo") y vuelva a presionar Confirmar. |
| **"Código de producto ya existente"** | Al crear un producto manual, se ingresó un código que ya pertenece a otro artículo. | Los códigos deben ser únicos globalmente. Utilice el botón "Generar Automático" para que el sistema asigne un código nuevo garantizado sin colisión. |
| **"No se puede eliminar la categoría"** | Se intentó borrar una categoría que actualmente tiene productos asociados asignados. | Reasigne primero los productos vinculados a otra categoría diferente antes de proceder a la eliminación. |
| **"Error de conexión con el servidor"** | El dispositivo perdió la conexión a Internet/Wi-Fi o el servidor de base de datos no está respondiendo. | 1. Compruebe la conexión de red de su dispositivo.<br>2. Si está en red local, verifique estar conectado a la red Wi-Fi de la empresa.<br>3. Espere unos momentos y vuelva a intentar la operación. |

---

> 📄 **Fin del Manual de Usuario**  
> *Para soporte técnico adicional, dudas de configuración de hardware o reportes de fallas, contacte al Administrador del Sistema de Inventario de su organización.*
