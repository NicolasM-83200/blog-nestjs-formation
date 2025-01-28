import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({
      data: createUserDto,
    });
  }

  async findAll(query?: { [key: string]: string }): Promise<User[]> {
    if (Object.keys(query).length === 0) {
      return this.prismaService.user.findMany({
        orderBy: {
          id: 'asc',
        },
      });
    }
    return this.prismaService.user.findMany({
      where: {
        id: {
          equals: Number(query.id),
        },
      },
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
