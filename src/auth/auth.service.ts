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

  async createJwt(
    payload: IPayloadType,
    secret: string,
    expiresIn: string | number,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, { secret, expiresIn });
  }

  async createToken(data: {
    userId: number;
    token: string;
    type: TypeTokenEnum;
    expirationDate?: Date;
  }): Promise<Token> {
    return this.prismaService.token.create({ data });
  }

  async getByUnique(userId: number, type: TypeTokenEnum): Promise<Token> {
    return this.prismaService.token.findUnique({
      where: { type_userId: { userId, type } },
    });
  }

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

  async deleteToken(type_userId: {
    userId: number;
    type: TypeTokenEnum;
  }): Promise<void> {
    await this.prismaService.token.delete({
      where: { type_userId },
    });
  }
}
