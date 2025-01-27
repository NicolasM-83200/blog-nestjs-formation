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
  create(@Body() createUserDto: CreateUserDto): {
    message: string;
    user: User;
  } {
    return {
      message: 'User created successfully',
      user: this.usersService.create(createUserDto),
    };
  }

  @Get()
  getAll(@Query() query: { [key: string]: string }): {
    message: string;
    users: User[];
  } {
    return {
      message:
        Object.keys(query).length === 0
          ? 'All users retrieved successfully'
          : `Users filtered by ${Object.entries(query)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')}`,
      users: this.usersService.getAll(query),
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
