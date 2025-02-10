import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Module global pour le service Prisma
 * @Global() - Indique que le module est global
 * @Module - Indique que le module est un module NestJS
 * @exports - Indique que le service Prisma est exporté
 * @providers - Indique que le service Prisma est fourni
 */
@Global()
@Module({
  exports: [PrismaService],
  providers: [PrismaService],
})
export class PrismaModule {}
