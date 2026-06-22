---
name: validation
description: >-
  DTO and input validation with class-validator. Use when ImplementerAgent creates
  or modifies request/response DTOs in NestJS APIs.
---

# Validation

DTO conventions for NestJS. **Copy decorator style from existing DTOs in the same module.**

## DTO template

```typescript
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  department?: string;
}
```

## Rules

- One DTO per use case (`CreateXDto`, `UpdateXDto`, `XQueryDto`) — match project naming
- Use `class-validator` decorators; required fields get `@IsNotEmpty()` or type-specific validators
- Optional fields: `@IsOptional()` **before** other validators
- Enums: `@IsEnum(MyEnum)` with shared enum from domain/types
- Response DTOs when the project uses them; otherwise typed interfaces are fine if that is the local convention
- No validation logic in controllers — DTO + global `ValidationPipe` handles input

## Common decorators

| Need | Decorator |
|------|-----------|
| String | `@IsString()` |
| Email | `@IsEmail()` |
| UUID | `@IsUUID()` |
| Number | `@IsInt()` / `@IsNumber()` |
| Boolean | `@IsBoolean()` |
| Array | `@IsArray()` + `@ValidateNested({ each: true })` |
| Date string | `@IsISO8601()` |

## Export / query DTOs

- Query params: dedicated `*QueryDto` with `@Type(() => Number)` for numeric query fields when using `class-transformer`
