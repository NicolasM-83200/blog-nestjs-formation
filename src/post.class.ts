import { User } from './user.class';

export class Post {
  private static nextId: number = 1;
  id: number;
  title: string;
  description: string;
  user: User;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(title: string, description: string, user: User) {
    this.id = Post.nextId++;
    this.title = title;
    this.description = description;
    this.user = user;
    this.isPublished = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
