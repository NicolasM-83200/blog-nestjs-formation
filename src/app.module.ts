import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [UsersModule, PostsModule, AuthModule, PrismaModule],
})
export class AppModule {}
