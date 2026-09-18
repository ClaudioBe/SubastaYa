# SubastaYa

**SubastaYa** es una plataforma web de subastas en tiempo real: publicación de artículos, pujas competitivas con actualización instantánea vía WebSocket, un sistema de garantía (**escrow**) que retiene el saldo del pujador líder, mecánica **anti-sniping** que extiende el cierre si llega una oferta de último momento, y liquidación automática de subastas vencidas mediante un proceso en segundo plano.

## Stack

- **Backend**: Node.js + Express 5, Sequelize (PostgreSQL), Socket.IO, sequelize-cli para migraciones.
- **Frontend**: React 19 + Vite, React Router, Axios, Bootstrap 5, Socket.IO client.

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior (probado con 22).
- [PostgreSQL](https://www.postgresql.org/) 13 o superior, corriendo localmente (o accesible por red).
- `npm` (viene con Node).

## 1. Clonar e instalar dependencias

```bash
git clone https://github.com/ClaudioBe/SubastaYa.git
cd SubastaYa

cd api
npm install

cd ../client
npm install
```

## 2. Configurar las variables de entorno

En `api/`, copiá el archivo de ejemplo y completalo con tus datos de PostgreSQL:

```bash
cd api
cp .env.example .env
```

Editá `api/.env`:

```
PORT=3001
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=subastaya
```

## 3. Levantar la base de datos

Creá la base (vacía) con el nombre que pusiste en `DB_NAME`:

```bash
createdb -U postgres subastaya
```

(o desde `psql`: `CREATE DATABASE subastaya;`)

## 4. Ejecutar las migraciones

El esquema de la base se genera **exclusivamente** a partir de las migraciones en `api/migrations/` — no hay ningún `sync()` automático. Desde `api/`:

```bash
npx sequelize-cli db:migrate
```

Esto crea todas las tablas (`users`, `categories`, `auctions`, `wallets`, `bids`, `transaction_ledgers`, `audit_logs`) en el orden correcto, respetando las relaciones entre ellas.

Para tener datos de prueba (usuarios, categorías y subastas de ejemplo — ver el detalle en la sección [Datos semilla](#datos-semilla-para-pruebas) más abajo):

```bash
npx sequelize-cli db:seed:all
```

## 5. Lanzar la aplicación

Backend (puerto `3001` por defecto, definido en `.env`):

```bash
cd api
npm start
```

Deberías ver:

```
Conexión con la base de datos establecida.
Server listening at 3001
```

El backend levanta junto con el servidor HTTP el socket de WebSocket (tiempo real) y el worker en segundo plano que activa subastas programadas y liquida las vencidas (corre cada 30 segundos por defecto).

En otra terminal, el frontend (puerto `3000`):

```bash
cd client
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

## Comandos útiles

| Comando | Dónde | Qué hace |
|---|---|---|
| `npm start` | `api/` | Levanta el backend con recarga automática (nodemon) |
| `npm run dev` | `client/` | Levanta el frontend en modo desarrollo (Vite) |
| `npm run build` | `client/` | Compila el frontend para producción |
| `npx sequelize-cli db:migrate` | `api/` | Aplica las migraciones pendientes |
| `npx sequelize-cli db:migrate:undo` | `api/` | Revierte la última migración |
| `npx sequelize-cli db:seed:all` | `api/` | Carga los datos de prueba |

## Arquitectura y decisiones de diseño

- **Concurrencia optimista**: las entidades `Wallet` y `Auction` tienen un campo `version`. Si dos peticiones intentan modificar el mismo registro al mismo tiempo (por ejemplo, dos pujas simultáneas), solo la primera prospera — la segunda encuentra la versión desactualizada y se rechaza de forma controlada, sin corromper datos. Ver la sección [Prueba de concurrencia](#prueba-de-concurrencia-stress-test) para un caso de prueba concreto.
- **Transaccionalidad**: las operaciones críticas (retención/liberación de saldo, liquidación de subastas) corren dentro de transacciones de Sequelize — si algún paso falla, se revierte todo el conjunto de cambios.
- **Worker en segundo plano**: un proceso (`api/src/workers/auctionSettlementWorker.js`) corre cada 30 segundos por defecto (ajustable con `AUCTION_WORKER_INTERVAL_MS`) y se encarga de: activar subastas `PRÓXIMA` cuya fecha de inicio ya llegó, y liquidar subastas `ACTIVA` cuya fecha de fin ya pasó (`FINALIZADA` con transferencia de saldo si hubo pujas, o `DESIERTA` si no hubo ninguna).
- **Auditoría**: cada cambio de estado ejecutado por el worker, cada extensión por anti-sniping y cada puja rechazada quedan registrados en `audit_logs`.

## Datos semilla para pruebas

Al correr `npx sequelize-cli db:seed:all` quedan cargados los siguientes usuarios y subastas (contraseña `12345` para todos):

### Usuarios y billeteras

| Usuario | Rol en las pruebas | Total | Retenido | Disponible |
|---|---|---|---|---|
| `vendedor@test.com` | Vendedor de las subastas de ejemplo | $0 | $0 | $0 |
| `comprador1@test.com` | Postor líder activo | $150.000 | $45.000 | $105.000 |
| `comprador2@test.com` | Postor habilitado | $200.000 | $0 | $200.000 |
| `sinfondos@test.com` | Cuenta para probar validación de saldo insuficiente | $500 | $0 | $500 |

### Subastas de ejemplo

1. **Activa estándar** — cierra en ~25 minutos, con 2 pujas previas (líder actual: `comprador1`, $45.000).
2. **Activa crítica** — cierra en ~30 segundos, para probar la extensión de tiempo por anti-sniping.
3. **Próxima** — programada para iniciar en 24hs (las pujas deben estar bloqueadas hasta que el worker la active).
4. **Vencida con ganador** — fecha límite ya superada, con puja registrada, para validar la liquidación del worker.
5. **Vencida desierta** — finalizada sin ninguna oferta, para comprobar el pase automático a `DESIERTA`.

## Prueba de concurrencia (stress test)

Para demostrar que la retención de saldo usa concurrencia optimista, el backend aplica un lock por fila sobre la subasta: si dos compradores distintos pujan por el mismo monto en el mismo instante, la base de datos solo debe registrar una puja y rechazar la otra.

Con el backend corriendo, guardá esto como `stress-test-concurrencia.sh` y corrélo desde una terminal bash (Git Bash en Windows):

```bash
#!/bin/bash
# Prueba de concurrencia optimista: dos compradores DISTINTOS pujan por la misma
# oferta, por el mismo monto, en el mismo instante. Se espera que la base de
# datos registre solo una puja y rechace la otra.
#
# Requisitos previos: una subasta ACTIVA con un lider (una puja previa). Ajustar
# AUCTION_ID, BUYER_B y BUYER_C con ids reales de tu base (por ejemplo, con los
# datos semilla: la subasta 1 ya tiene a comprador1 liderando con $45.000).

AUCTION_ID=1
BUYER_B=2
BUYER_C=3
AMOUNT=50000   # debe superar la puja actual + el incremento minimo

curl -s -w "\n[Comprador B] HTTP %{http_code}\n" -X POST \
  "http://localhost:3001/auctions/${AUCTION_ID}/bids" \
  -H "Content-Type: application/json" \
  -d "{\"buyerId\":\"${BUYER_B}\",\"amount\":${AMOUNT}}" &

curl -s -w "\n[Comprador C] HTTP %{http_code}\n" -X POST \
  "http://localhost:3001/auctions/${AUCTION_ID}/bids" \
  -H "Content-Type: application/json" \
  -d "{\"buyerId\":\"${BUYER_C}\",\"amount\":${AMOUNT}}" &

wait
```

```bash
bash stress-test-concurrencia.sh
```

Resultado esperado: una de las dos respuestas devuelve `HTTP 200` (puja aceptada) y la otra `HTTP 400` (rechazada por validación de monto, porque la primera ya movió el precio) o `HTTP 409` (si el rechazo ocurre específicamente por un conflicto de concurrencia sobre la billetera). Nunca deberían aceptarse las dos.
