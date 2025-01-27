import { Injectable } from '@nestjs/common';
import { User } from 'src/user.class';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  users: User[] = [];

  create(createUserDto: CreateUserDto): User {
    const user = new User(
      createUserDto.firstname,
      createUserDto.lastname,
      createUserDto.email,
      createUserDto.password,
      createUserDto.isAdmin,
    );
    this.users.push(user);
    return user;
  }

  getAll(query?: { [key: string]: string }) {
    if (Object.keys(query).length === 0) return this.users;
    return this.users.filter((user) => {
      return Object.entries(query).every(([key, value]) => {
        const userValue = user[key as keyof User];
        return String(userValue)
          .toLowerCase()
          .includes(String(value).toLowerCase());
      });
    });
  }

  getById(id: number): User {
    return this.users.find((user) => user.id === id);
  }

  update(id: number, updateUserDto: UpdateUserDto): User {
    const user = this.getById(id);
    return Object.assign(user, { ...updateUserDto, updatedAt: new Date() });
  }

  delete(id: number): User {
    const index = this.users.indexOf(this.getById(id));
    const [deletedUser] = this.users.splice(index, 1);
    return deletedUser;
  }
}
