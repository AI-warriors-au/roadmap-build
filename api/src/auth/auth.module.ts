import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createGithubProvider, GITHUB_OAUTH } from './oauth-providers';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: GITHUB_OAUTH,
      useFactory: (config: ConfigService) => createGithubProvider(config),
      inject: [ConfigService],
    },
    // Google OAuth disabled until a Google Cloud OAuth app is available.
    // {
    //   provide: GOOGLE_OAUTH,
    //   useFactory: (config: ConfigService) => createGoogleProvider(config),
    //   inject: [ConfigService],
    // },
  ],
})
export class AuthModule {}
