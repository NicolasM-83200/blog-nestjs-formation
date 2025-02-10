import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IPayloadType } from './type';
import { Token, TypeTokenEnum } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Création d'un JWT
   * @param payload - Données à inclure dans le JWT
   * @param secret - Clé secrète pour le JWT
   * @param expiresIn - Durée d'expiration du JWT
   * @returns Promise<string> - JWT créé
   */
  async createJwt(
    payload: IPayloadType,
    secret: string,
    expiresIn: string | number,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, { secret, expiresIn });
  }

  /**
   * Création d'un token
   * @param data - Données à inclure dans le token
   * @returns Promise<Token> - Token créé
   */
  async createToken(data: {
    userId: number;
    token: string;
    type: TypeTokenEnum;
    expirationDate?: Date;
  }): Promise<Token> {
    return this.prismaService.token.create({ data });
  }

  /**
   * Récupération d'un token unique
   * @param userId - ID de l'utilisateur
   * @param type - Type de token
   * @returns Promise<Token> - Token trouvé
   */
  async getByUnique(userId: number, type: TypeTokenEnum): Promise<Token> {
    return this.prismaService.token.findUnique({
      where: { type_userId: { userId, type } },
    });
  }

  /**
   * Mise à jour ou création d'un token
   * @param userId - ID de l'utilisateur
   * @param token - Token à mettre à jour ou créer
   * @param type - Type de token
   * @returns Promise<Token> - Token mis à jour ou créé
   */
  async upsertToken(
    userId: number,
    token: string,
    type: TypeTokenEnum,
  ): Promise<Token> {
    return this.prismaService.token.upsert({
      where: { type_userId: { userId, type } },
      update: { token },
      create: { userId, token, type },
    });
  }

  /**
   * Suppression d'un token
   * @param type_userId - Type et ID de l'utilisateur
   * @returns Promise<void> - Token supprimé
   */
  async deleteToken(type_userId: {
    userId: number;
    type: TypeTokenEnum;
  }): Promise<void> {
    await this.prismaService.token.delete({
      where: { type_userId },
    });
  }
}
