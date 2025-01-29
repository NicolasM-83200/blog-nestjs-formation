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
        isAdmin: async ({ filter }) => {
          const boolValue = filter === 'true';
          return {
            where: {
              isAdmin: {
                equals: boolValue,
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

  async findOne(id: number): Promise<User> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async delete(id: number): Promise<User> {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
