import { IsOptional, IsString } from 'class-validator';

/**
 * Query contract for GET /roadmaps (SPA calls /api/roadmaps via Vite proxy).
 *
 * - `search` — case-insensitive substring match on title OR description.
 *   Empty/whitespace is treated as no search filter.
 * - `tags` — comma-separated Tag.slug values; OR match (any tag).
 *   Tokens are trimmed and lowercased before matching.
 */
export class ListRoadmapsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  tags?: string;
}
