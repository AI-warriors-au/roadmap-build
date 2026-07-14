import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  DISPLAY_NAME_MAX_LENGTH,
  UpdateProfileDto,
} from './update-profile.dto';

async function validateDto(input: unknown): Promise<string[]> {
  const dto = plainToInstance(UpdateProfileDto, input);
  const errors = await validate(dto);
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
}

describe('UpdateProfileDto', () => {
  it('accepts a valid display name', async () => {
    await expect(validateDto({ displayName: 'Ada Lovelace' })).resolves.toEqual(
      [],
    );
  });

  it('trims surrounding whitespace before validating', () => {
    const dto = plainToInstance(UpdateProfileDto, {
      displayName: '  Ada  ',
    });

    expect(dto.displayName).toBe('Ada');
  });

  it('rejects a blank display name (empty after trim)', async () => {
    await expect(validateDto({ displayName: '   ' })).resolves.not.toEqual([]);
  });

  it('rejects a non-string display name', async () => {
    await expect(validateDto({ displayName: 42 })).resolves.not.toEqual([]);
  });

  it('rejects a display name over the maximum length', async () => {
    await expect(
      validateDto({ displayName: 'a'.repeat(DISPLAY_NAME_MAX_LENGTH + 1) }),
    ).resolves.not.toEqual([]);
  });
});
