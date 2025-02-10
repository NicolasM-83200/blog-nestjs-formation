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
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (!user)
      throw new CustomHttpException(
        "use can't be empty if @Roles is apply",
        HttpStatus.BAD_REQUEST,
        'RG-001',
      );

    if (!user.role) {
      throw new CustomHttpException(
        "User don't have role",
        HttpStatus.UNAUTHORIZED,
        'RG-002',
      );
    }
    return requiredRoles.includes(user.role);
  }
}
