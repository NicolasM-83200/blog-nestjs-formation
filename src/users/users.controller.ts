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
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, Role, User } from '@prisma/client';
import { GetUserParamsDto } from './dto/get-user-params.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.admin)
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
  async findAll(@Query() query: GetUserParamsDto): Promise<{
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

  @Get('/active-in-last-week')
  async findActiveInLastWeek(): Promise<{
    message: string;
    users: Partial<User>[];
  }> {
    return {
      message: 'Users active in last week fetched successfully',
      users: await this.usersService.findActiveInLastWeek(),
    };
  }

  @Get('/:id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<{
    message: string;
    user: User;
  }> {
    const user = await this.usersService.findOneById(id);
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
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `User with id: ${id} updated`,
      user: await this.usersService.update(id, updateUserDto),
    };
  }

  @Delete('/:id')
  @Roles(Role.admin)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{
    message: string;
    user: User;
  }> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `User with id: ${id} deleted`,
      user: await this.usersService.delete(id),
    };
  }
}
