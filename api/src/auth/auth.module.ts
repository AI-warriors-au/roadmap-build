import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  createGithubProvider,
  createGoogleProvider,
  GITHUB_OAUTH,
  GOOGLE_OAUTH,
} from './oauth-providers';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: GOOGLE_OAUTH,
      useFactory: (config: ConfigService) => createGoogleProvider(config),
      inject: [ConfigService],
    },
    {
      provide: GITHUB_OAUTH,
      useFactory: (config: ConfigService) => createGithubProvider(config),
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
