# SubastaYa

Plataforma de subastas online: publicación de artículos, pujas en tiempo real, billetera con retención de saldo (escrow), liquidación automática de subastas vencidas y auditoría de eventos.

## Stack

- **Backend**: Node.js + Express 5, Sequelize (PostgreSQL), Socket.IO, sequelize-cli para migraciones.
- **Frontend**: React 19 + Vite, React Router, Axios, Bootstrap 5, Socket.IO client.

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior (probado con 22).
- [PostgreSQL](https://www.postgresql.org/) 13 o superior, corriendo localmente (o accesible por red).
- `npm` (viene con Node).

## 1. Clonar e instalar dependencias

```bash
git clone <https://github.com/ClaudioBe/SubastaYa.git>
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

Opcionalmente, para tener datos de prueba (usuarios, categorías y subastas de ejemplo):

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

## Prueba de concurrencia (stress test)

Para demostrar que la retención de saldo usa concurrencia optimista, el backend acepta un lock por fila sobre la subasta: si dos compradores distintos pujan por el mismo monto en el mismo instante, la base de datos solo debe registrar una puja y rechazar la otra.

Con el backend corriendo, guardá esto como `stress-test-concurrencia.sh` y corrélo desde una terminal bash (Git Bash en Windows):

```bash
#!/bin/bash
# Prueba de concurrencia optimista: dos compradores DISTINTOS pujan por la misma
# oferta, por el mismo monto, en el mismo instante. Se espera que la base de
# datos registre solo una puja y rechace la otra.
#
# Requisitos previos: una subasta ACTIVA con un lider (una puja previa). Ajustar
# AUCTION_ID, BUYER_B y BUYER_C con ids reales de tu base.

AUCTION_ID=1
BUYER_B=2
BUYER_C=3
AMOUNT=300   # debe superar la puja actual + el incremento minimo

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


