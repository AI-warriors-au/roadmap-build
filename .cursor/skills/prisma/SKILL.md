---
name: prisma
description: >-
  Prisma schema, migrations, and query patterns. Use when ImplementerAgent touches
  prisma/schema.prisma or database access.
---

# Prisma

Compact database conventions. **Read `prisma/schema.prisma` and existing migrations first.**

## Schema changes

1. Edit `prisma/schema.prisma`
2. Generate migration:

```bash
npx prisma migrate dev --name <descriptive_snake_case>
```

3. Never hand-edit migration SQL unless fixing a failed migration — prefer schema fix + new migration

## Naming

| Item | Convention |
|------|------------|
| Model | PascalCase singular (`User`, `ExportLog`) |
| Field | camelCase |
| Migration | `YYYYMMDDHHMMSS_<snake_case_description>` |

## Queries in services

- Inject `PrismaService` (or project wrapper)
- Use typed `Prisma.*` inputs where available
- Select only needed fields for list/export endpoints
- Paginate large datasets; avoid loading unbounded rows

```typescript
const users = await this.prisma.user.findMany({
  select: { id: true, name: true, email: true, role: true, createdAt: true },
  orderBy: { createdAt: 'asc' },
});
```

## Rules

- Every schema change **must** have a migration (**implementer** Rule 6)
- Respect existing relations and soft-delete patterns in the schema
- Use transactions for multi-table writes that must succeed or fail together
- Do not raw-query unless the codebase already does for that case
