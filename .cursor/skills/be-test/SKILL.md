---
name: be-test
description: >-
  Backend unit and e2e tests for learnmap/api — Jest, NestJS TestingModule,
  supertest. Use when ImplementerAgent changes api/ code or writes backend tests.
---

# Backend tests (`api/`)

Testing conventions for **`learnmap/api`**. Read existing `*.spec.ts` in the same module first.

## Verification commands

Run from **`api/`**:

| Check | Command |
|-------|---------|
| Lint | `npm run lint` |
| Build | `npm run build` |
| Unit + e2e | `npm run test` |
| Unit only | `jest` (via package script) |
| E2e only | `npm run test:e2e` |
| Watch | `npm run test:watch` |

`npm run test` runs unit tests **and** e2e. Run lint, build, and test after every backend change. Record results in the implementer handover.

## File layout

| Pattern | Location | Use for |
|---------|----------|---------|
| `*.spec.ts` | Co-located with service/controller | Unit tests |
| `test/*.e2e-spec.ts` | `api/test/` | HTTP integration / e2e |

Co-locate unit specs next to the file under test (e.g. `health.service.spec.ts` beside `health.service.ts`).

## Example — service unit test

Mock dependencies at the module boundary (Prisma, external clients):

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { HealthService } from './health.service'
import { PrismaService } from '../prisma/prisma.service'

describe('HealthService', () => {
  let service: HealthService
  let prisma: { isHealthy: jest.Mock }

  beforeEach(async () => {
    prisma = { isHealthy: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get(HealthService)
  })

  it('returns ok when the database is healthy', async () => {
    prisma.isHealthy.mockResolvedValue(true)

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      database: 'connected',
    })
  })

  it('returns unhealthy when the database is unavailable', async () => {
    prisma.isHealthy.mockResolvedValue(false)

    await expect(service.check()).resolves.toEqual({
      status: 'unhealthy',
      database: 'disconnected',
    })
  })
})
```

## Example — controller unit test

Mock the service; assert status codes and DTO shape:

```typescript
describe('UsersController', () => {
  let controller: UsersController
  let usersService: { findMe: jest.Mock }

  beforeEach(async () => {
    usersService = { findMe: jest.fn() }
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile()
    controller = module.get(UsersController)
  })

  it('returns the current user', async () => {
    usersService.findMe.mockResolvedValue({ id: '1', email: 'a@b.com' })
    await expect(controller.me({ user: { id: '1' } })).resolves.toMatchObject({
      email: 'a@b.com',
    })
  })
})
```

## Example — e2e (HTTP)

Use sparingly for route wiring; prefer unit tests for business logic:

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from './../src/app.module'

describe('Health (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect((res) => {
        expect([200, 503]).toContain(res.status)
        expect(res.body).toHaveProperty('status')
      })
  })
})
```

## What to test

| Layer | Focus |
|-------|-------|
| Service | Business logic, permissions, edge cases from AC |
| Controller | Route wiring, guards, status codes (mock service) |
| Guard / pipe | Authorisation decisions, transform/validation behaviour |
| DTO | Validation rules for invalid input (if project tests DTOs) |

## Rules

- **Every backend logic change** needs added or updated unit tests before handover
- Mock at boundaries (Prisma, HTTP clients) — not private methods
- Cover acceptance criteria: happy path + permission denied + key error cases
- Schema changes need migrations (**prisma** skill) **and** updated tests if behaviour changes
- Do not delete failing tests to make CI green
- On failure: one focused fix attempt, re-run; else document as blocker in handover
