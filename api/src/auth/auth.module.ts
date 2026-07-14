import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { resolveJwtExpiresIn } from './jwt-expires-in';
import { JwtAuthGuard } from './jwt-auth.guard';
import { createGithubProvider, GITHUB_OAUTH } from './oauth-providers';
import { SessionService } from './session.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: resolveJwtExpiresIn(config.get<string>('JWT_EXPIRES_IN')),
        },
      }),
    }),
  ],
  controllers: [AuthController, UserController],
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
