# API package — Bugbot context

PRs changing files under `api/` must follow the standards in the root [BUGBOT.md](../../.cursor/BUGBOT.md).

**Focus areas for this package:**

- NestJS module/controller/service separation
- Prisma migrations for every schema change
- DTO validation on all write endpoints
- Tests for new or changed service logic
- `GET /health` behaviour with and without PostgreSQL

**Run locally before merge:**

```bash
npm run lint:api
npm run build:api
cd api && npm run test
docker compose up -d   # for DB-connected verification
curl http://localhost:3000/health
```
