import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { CustomHttpException } from 'src/exceptions/customhttp.exception';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Récupération des rôles requis pour accéder à la ressource
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Si aucun rôle n'est requis, on autorise l'accès à la ressource
    if (!requiredRoles) {
      return true;
    }
    // Récupération de l'utilisateur
    const { user } = context.switchToHttp().getRequest();
    // Si l'utilisateur n'existe pas, on renvoie une erreur
    if (!user)
      throw new CustomHttpException(
        "use can't be empty if @Roles is apply",
        HttpStatus.BAD_REQUEST,
        'RG-001',
      );
    // Si l'utilisateur n'a pas de rôle, on renvoie une erreur
    if (!user.role) {
      throw new CustomHttpException(
        "User don't have role",
        HttpStatus.UNAUTHORIZED,
        'RG-002',
      );
    }
    // Vérification si l'utilisateur a le rôle requis
    return requiredRoles.includes(user.role);
  }
}
