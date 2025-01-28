import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<{
    message: string;
    user: User;
  }> {
    try {
      return {
        message: 'User created successfully',
        user: await this.usersService.create(createUserDto),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (error.code === 'P2002') {
          throw new ConflictException(
            'There is a unique constraint violation, a new user cannot be created with this email',
          );
        }
      }
      throw error;
    }
  }

  @Get()
  async findAll(@Query() query: { [key: string]: string }): Promise<{
    message: string;
    users: User[];
  }> {
    return {
      message:
        Object.keys(query).length === 0
          ? 'All users retrieved successfully'
          : `Users filtered by ${Object.entries(query)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')}`,
      users: await this.usersService.findAll(query),
    };
  }

  @Get('/:id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<{
    message: string;
    user: User;
  }> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `User with id: ${id} fetched`,
      user,
    };
  }

  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ message: string; user: User }> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `User with id: ${id} updated`,
      user: await this.usersService.update(id, updateUserDto),
    };
  }

  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{
    message: string;
    user: User;
  }> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `User with id: ${id} deleted`,
      user: await this.usersService.delete(id),
    };
  }
}
