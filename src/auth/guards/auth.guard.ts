import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
import { CustomHttpException } from 'src/exceptions/customhttp.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Récupération des informations publiques
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Si les informations sont publiques, on autorise l'accès à la ressource
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    // Récupération de la requête
    const request = context.switchToHttp().getRequest();
    // Récupération du token
    const token = this.extractTokenFromHeader(request);
    // Si le token n'est pas présent, on renvoie une erreur
    if (!token) {
      throw new CustomHttpException(
        'No token provided!',
        HttpStatus.UNAUTHORIZED,
        'AG-001',
      );
    }
    try {
      // Vérification du token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      // 💡 On assigne le payload à l'objet request ici
      // afin que nous puissions y accéder dans nos gestionnaires de routes
      request['user'] = payload;
    } catch (error) {
      // Si le token n'est pas valide, on renvoie une erreur
      throw new CustomHttpException(
        error.message,
        HttpStatus.UNAUTHORIZED,
        'AG-002',
      );
    }
    return true;
  }

  // Extraction du token
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
