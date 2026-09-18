# SubastaYa - Plataforma de Subastas en Tiempo Real

**SubastaYa** es una plataforma web de comercio electrónico y subastas en tiempo real diseñada para modernizar y asegurar las compras y ventas competitivas en línea. El proyecto está construido bajo una arquitectura sólida que prioriza la confianza económica mediante un sistema de garantía (Escrow) y el juego limpio a través de mecánicas Anti-sniping.

---

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu entorno de desarrollo:
* **Entorno de ejecución:** [Indicar versión, ej: Node.js v18+, .NET 8, Java 17, etc.]
* **Base de datos:** [Indicar motor relacional utilizado, ej: PostgreSQL, MySQL, SQL Server]
* **Gestor de paquetes:** [Indicar, ej: npm, NuGet, Maven, Pip]

---

## 🛠️ Instrucciones de Instalación y Despliegue

Sigue estos pasos secuenciales para compilar y ejecutar la aplicación de forma local:

### 1. Clonar el repositorio
```bash
git clone https://github.com[TU_USUARIO_O_ORGANIZACION]/SubastaYa.git
cd SubastaYa
```

### 2. Configuración y Ejecución del Backend
1. Navega al directorio del backend:
   ```bash
   cd api
   ```
2. Configura las variables de entorno en el archivo correspondiente (`.env` / `appsettings.json` / `application.properties`):
   ```env
   DATABASE_URL=tu_cadena_de_conexion
   PORT=5000
   ```
3. Instala las dependencias necesarias:
   ```bash
   # Cambiar según el stack tecnológico elegido
   npm install
   ```
4. **Ejecutar Migraciones (Code-First):** Genera el esquema de la base de datos de manera automatizada:
   ```bash
   # Dentro de api:
   npx sequelize-cli db:migrate
  
5. **Cargar Datos Semilla (Seed Data):** Inicializa los usuarios de prueba, categorías y casos de prueba obligatorios:
   ```bash
   # Dentro de api:
   npx sequelize-cli db:seed:all
   ```
6. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### 3. Configuración y Ejecución del Frontend
1. Navega al directorio del frontend:
   ```bash
   cd ../client
   ```
2. Instala las dependencias del cliente:
   ```bash
   npm install
   ```
3. Inicia la aplicación web:
   ```bash
   npm run dev
   ```
4. Accede desde tu navegador a: `http://localhost:3000`

---

## 🧠 Arquitectura y Decisiones de Diseño

El sistema se ha diseñado siguiendo estándares modernos de desarrollo de software para garantizar un sistema extensible, mantenible y desacoplado:

* **Estrategia de Concurrencia (Optimistic Locking):** Para mitigar condiciones de carrera durante las pujas concurrentes, se incorporó un campo `version` en la entidad de las Billeteras(Wallets) y Subastas(Auctions). Esto asegura que si dos peticiones intentan modificar un registro simultáneamente, solo la primera prospera y la segunda arroja un conflicto controlado.
* **Transaccionalidad (ACID):** Las operaciones críticas (como el débito/crédito y retención de saldos) se ejecutan bajo bloques transaccionales atómicos que garantizan un `Rollback` absoluto ante cualquier fallo del sistema.
* **Procesamiento en Segundo Plano (Worker):** Un servicio en background (`Worker`) monitorea constantemente el estado temporal de las subastas para darlas por finalizadas o desiertas y liquidar los saldos correspondientes de forma automatizada.
* **Documentación Viva:** La API REST expone de forma nativa su documentación técnica autogenerada mediante **Swagger UI**, accesible en la ruta local `/api-docs`.

---

## 👥 Datos Semilla para Pruebas (Seed Data)

Para interactuar con el sistema, se han pre-cargado los siguientes perfiles y escenarios base en el entorno de base de datos:

### Usuarios y Billeteras
* **Vendedor (`vendedor@test.com`):** Creador de publicaciones generales. Saldo inicial: `$0`.
* **Comprador 1 (`comprador1@test.com`):** Postor líder activo. Saldo Total: `$150.000` / Retenido: `$45.000` / Disponible: `$105.000`.
* **Comprador 2 (`comprador2@test.com`):** Postor habilitado. Saldo Total: `$200.000` / Disponible: `$200.000`.
* **Sin Fondos (`sinfondos@test.com`):** Cuenta restringida para pruebas de validación. Saldo Total: `$500`.

### Casos de Uso de Subastas Incorporados
1. **Activa estándar:** Finaliza en 20-30 minutos con un historial de 2 pujas previas cargadas (Líder actual: `$45.000`).
2. **Activa crítica:** Cierra en menos de 2 minutos, idónea para validar los cambios de color del temporizador visual y la extensión del tiempo por la regla Anti-sniping.
3. **Próxima:** Subasta programada para iniciar en 24 horas (tiene las pujas deshabilitadas preventivamente).
4. **Vencida con ganador:** Subasta con fecha límite superada y pujas registradas para validar el procesamiento final del Background Worker.
5. **Vencida desierta:** Subasta finalizada sin ofertas para comprobar el cambio automático a estado `DESIERTA`.
