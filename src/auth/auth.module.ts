import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';

@Module({
  /**
   * Importation des modules nécessaires
   * @constant
   * @type {Object}
   * @property {Object} forwardRef - Fournisseur de service pour les modules forwardRef
   * @property {Object} UsersModule - Fournisseur de service pour le module Users
   */
  imports: [forwardRef(() => UsersModule), JwtModule],
  controllers: [AuthController],
  /**
   * Définition des fournisseurs de services
   * @constant
   * @type {Object}
   * @property {Object} APP_GUARD - Fournisseur de service pour le guard d'authentification
   * @property {Object} RolesGuard - Fournisseur de service pour le guard de rôles
   */
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
