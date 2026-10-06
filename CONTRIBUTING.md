# Setup

The API container and PostgreSQL talk on a Docker network named `notes-net`. The database container is named `notes-db`. The API uses that name as the database host. It does not use `localhost`.

## Requirements

- Docker
- Node.js 20 or newer, only if you apply Prisma migrations from your machine

## Install and run

Create the network:

```bash
docker network create notes-net
```

Start PostgreSQL on that network. Port 5432 is published so Prisma on your machine can reach the database too.

```bash
docker run -d --name notes-db --network notes-net -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 postgres
```

From the project directory, install dependencies and create the tables. This command runs on your machine, so the host is `localhost` even though `.env` says `notes-db`.

```powershell
npm install
$env:DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
npx prisma migrate deploy
```

Build the API image and start it on the same network:

```bash
docker build -t compose-project .
docker run --rm --name notes-api --network notes-net -p 3000:3000 --env-file .env compose-project
```

Open http://localhost:3000.

`.env` is loaded only by the API container. `notes-db` in that file is the PostgreSQL container's name on `notes-net`.

## Stop

```bash
docker rm -f notes-api notes-db
docker network rm notes-net
```
