import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { GetUserParamsDto } from './dto/get-user-params.dto';
import { applyFilters } from 'src/utils/filters';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({
      data: createUserDto,
    });
  }

  async findAll(query?: GetUserParamsDto): Promise<User[]> {
    console.log(query);
    const { whereBuilder } = await applyFilters<Prisma.UserWhereInput>({
      appliedFiltersInput: query,
      availableFilters: {
        id: async ({ filter }) => {
          return {
            where: {
              id: {
                equals: Number(filter),
              },
            },
          };
        },
        firstname: async ({ filter }) => {
          return {
            where: {
              firstname: {
                equals: String(filter),
              },
            },
          };
        },
        lastname: async ({ filter }) => {
          return {
            where: {
              lastname: {
                equals: String(filter),
              },
            },
          };
        },
        email: async ({ filter }) => {
          return {
            where: {
              email: {
                equals: String(filter),
              },
            },
          };
        },
      },
    });

    return this.prismaService.user.findMany({
      where: whereBuilder,
    });
  }

  async findOneById(id: number): Promise<User> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async delete(id: number): Promise<User> {
    return this.prismaService.$transaction(async (tx) => {
      // 1. Supprimer tous les likes des posts de l'utilisateur
      await tx.like.deleteMany({
        where: { post: { userId: id } },
      });
      // 2. Supprimer tous les likes de l'utilisateur
      await tx.like.deleteMany({
        where: { userId: id },
      });
      // 3. Supprimer tous les posts de l'utilisateur
      await tx.post.deleteMany({
        where: { userId: id },
      });
      // 4. Supprimer l'utilisateur
      return tx.user.delete({
        where: { id },
      });
    });
  }

  async findActiveInLastWeek(): Promise<Partial<User>[]> {
    return this.prismaService.user.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
      select: {
        firstname: true,
        lastname: true,
        email: true,
      },
    });
  }
}
