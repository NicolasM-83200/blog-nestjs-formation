import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service Prisma
 * @Injectable() - Indique que le service est injectable
 * @extends PrismaClient - Indique que le service hérite de PrismaClient
 * @implements OnModuleInit - Indique que le service implémente OnModuleInit
 * @implements OnModuleDestroy - Indique que le service implémente OnModuleDestroy
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
