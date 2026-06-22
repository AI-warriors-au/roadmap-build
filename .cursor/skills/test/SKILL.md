---
name: test
description: >-
  Unit testing and verification commands for NestJS/Prisma APIs. Use when
  ImplementerAgent writes tests or runs lint, build, and test suites.
---

# Test

Testing conventions and verification commands. **Read existing `*.spec.ts` in the same module first.**

## Verification commands

Discover from `package.json`; typical Fabric API:

| Check | Command |
|-------|---------|
| Lint | `npm run lint` |
| Build | `npm run build` |
| Unit tests | `npm run test` |

Run all three after implementation. Capture command, exit code, and brief output in handover.

## Unit test structure

Co-located `*.spec.ts` next to the file under test.

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('exports csv with required columns', async () => {
    prisma.user.findMany.mockResolvedValue([/* fixture */]);
    const result = await service.exportToCsv();
    expect(result).toContain('name,email,role,createdAt');
  });
});
```

## What to test

| Layer | Focus |
|-------|-------|
| Service | Business logic, permissions, edge cases from AC |
| Controller | Route wiring, guards, status codes (mock service) |
| DTO | Validation rules for invalid input (if project tests DTOs) |

## Rules

- Every business logic change needs added or updated tests (**implementer** Rule 5)
- Mock at boundaries (Prisma, HTTP clients) — not internal private methods
- Cover acceptance criteria: happy path + permission denied + key error cases
- On test failure: one focused fix attempt, re-run; else document as blocker
- Do not delete failing tests to make CI green
