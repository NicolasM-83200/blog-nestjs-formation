import { PureAbility } from '@casl/ability';
import { PrismaQuery, Subjects } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppSubjects =
  | 'all'
  | Subjects<{
      User: User;
    }>;

export type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;

@Injectable()
export class AbilityFactory {}
