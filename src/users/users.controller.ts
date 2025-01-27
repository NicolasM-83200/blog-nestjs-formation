import {
  Body,
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
import { User } from 'src/user.class';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<{
    message: string;
    user: User;
  }> {
    return {
      message: 'User created successfully',
      user: await this.usersService.createUser(createUserDto),
    };
  }

  @Get()
  async getAll(@Query() query: { [key: string]: string }): Promise<{
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
      users: await this.usersService.getAllUsers(query),
    };
  }

  @Get('/:id')
  getById(@Param('id', ParseIntPipe) id: number): {
    message: string;
    user: User;
  } {
    if (!this.usersService.getById(id)) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `User with id: ${id} fetched`,
      user: this.usersService.getById(+id),
    };
  }

  @Put('/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): { message: string; user: User } {
    if (!this.usersService.getById(id)) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `User with id: ${id} updated`,
      user: this.usersService.update(id, updateUserDto),
    };
  }

  @Delete('/:id')
  delete(@Param('id', ParseIntPipe) id: number): {
    message: string;
    user: User;
  } {
    if (!this.usersService.getById(id)) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `User with id: ${id} deleted`,
      user: this.usersService.delete(id),
    };
  }
}
