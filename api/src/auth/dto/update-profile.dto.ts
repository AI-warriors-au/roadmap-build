import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export const DISPLAY_NAME_MIN_LENGTH = 1;
export const DISPLAY_NAME_MAX_LENGTH = 80;

/** Only the display name is editable; email and avatar are read-only. */
export class UpdateProfileDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(DISPLAY_NAME_MIN_LENGTH)
  @MaxLength(DISPLAY_NAME_MAX_LENGTH)
  displayName!: string;
}
