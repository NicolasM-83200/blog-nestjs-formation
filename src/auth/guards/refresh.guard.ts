import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CustomHttpException } from 'src/exceptions/customhttp.exception';

@Injectable()
export class ResfreshGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Récupération de la requête
    const request = context.switchToHttp().getRequest();
    // Récupération du token
    const token = this.extractTokenFromHeader(request);
    // Si le token n'est pas présent, on renvoie une erreur
    if (!token) {
      throw new CustomHttpException(
        'No token provided!!',
        HttpStatus.UNAUTHORIZED,
        'RG-001',
      );
    }
    try {
      // Vérification du token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      // 💡 On assigne le payload à l'objet request ici
      // afin que nous puissions y accéder dans nos gestionnaires de routes
      request['user'] = payload;
      // On assigne le token à l'objet request ici
      // afin que nous puissions y accéder dans nos gestionnaires de routes
      request['refresh'] = token;
    } catch (error) {
      // Si le token n'est pas valide, on renvoie une erreur
      throw new CustomHttpException(
        error.message,
        HttpStatus.UNAUTHORIZED,
        'RG-002',
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
