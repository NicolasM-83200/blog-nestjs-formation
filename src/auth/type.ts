import { Request } from 'express';
import { Role } from '@prisma/client';
export interface IPayloadType {
  sub: number;
  email: string;
  role: Role;
}

export interface IRequestWithUser extends Request {
  user: IPayloadType;
}

export interface IRequestWithRefresh extends IRequestWithUser {
  refresh: string;
}
