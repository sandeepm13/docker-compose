# Notes API

A small TypeScript API that stores users and notes in PostgreSQL with Prisma.

## Setup

The API and PostgreSQL run on the Docker network `notes-net`. Installation commands are in [CONTRIBUTING.md](CONTRIBUTING.md).

The API listens on `http://localhost:3000`.

## Endpoints

| Method | Path | Body |
| --- | --- | --- |
| GET | `/health` | |
| GET | `/users` | |
| POST | `/users` | `{ "name", "email" }` |
| GET | `/notes` | optional `?published=true` |
| GET | `/notes/:id` | |
| POST | `/notes` | `{ "title", "content", "authorId", "published?" }` |
| PATCH | `/notes/:id` | `{ "title?", "content?", "published?" }` |
| DELETE | `/notes/:id` | |
