---
name: nestjs
description: >-
  NestJS patterns for modules, controllers, services, guards, and pipes. Use when
  ImplementerAgent adds or modifies NestJS API layers.
---

# NestJS

Compact conventions for Fabric NestJS APIs. **Read the nearest existing module first** — match its patterns.

## Module layout

```
src/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── dto/
│   ├── create-<feature>.dto.ts
│   └── ...
└── <feature>.service.spec.ts
```

## Controller

- Thin: route + guards + delegate to service
- Use DTOs for request/response (**validation** skill)
- HTTP exceptions from service layer or re-throw `HttpException` subclasses

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('export')
  @Roles(Role.Admin)
  exportUsers(@Res() res: Response): Promise<void> {
    return this.usersService.exportToCsv(res);
  }
}
```

## Service

- All business logic here; inject `PrismaService` or repositories
- Return domain data; let controller handle HTTP formatting when appropriate
- No direct `Request`/`Response` unless streaming/download (then accept as param)

## Module

- Register controller, service, imports (e.g. `PrismaModule`)
- Export service only if other modules need it

## Guards & pipes

- Reuse existing `@Roles()`, auth guards — do not invent parallel auth
- Global validation pipe assumed; DTOs use **validation** skill

## Rules

- Mirror naming and folder structure of the closest feature module
- Do not introduce new architectural layers without plan approval
- One controller per resource; avoid god services
