import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWT_DEFAULT_EXPIRES_IN } from './auth.types';
import { JwtAuthGuard } from './jwt-auth.guard';
import { createGithubProvider, GITHUB_OAUTH } from './oauth-providers';
import { SessionService } from './session.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ??
            JWT_DEFAULT_EXPIRES_IN) as StringValue,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
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
  exports: [SessionService, JwtModule],
})
export class AuthModule {}
