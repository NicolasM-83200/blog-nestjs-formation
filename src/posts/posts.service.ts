import { Injectable } from '@nestjs/common';
import { Post } from 'src/post.class';
import { User } from 'src/user.class';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  posts: Post[] = [];

  create(createPostDto: CreatePostDto, user: User): Post {
    const post = new Post(createPostDto.title, createPostDto.description, user);
    this.posts.push(post);
    return post;
  }

  getAll(query?: { [key: string]: string }): Post[] {
    if (Object.keys(query).length === 0) return this.posts;
    return this.posts.filter((post) => {
      return Object.entries(query).every(([key, value]) => {
        const postValue = post[key as keyof Post];
        return String(postValue)
          .toLowerCase()
          .includes(String(value).toLowerCase());
      });
    });
  }

  getById(id: number): Post {
    return this.posts.find((post) => post.id === id);
  }

  getByUser(userId: number): Post[] {
    return this.posts.filter((post) => post.user.id === userId);
  }

  update(id: number, updatePostDto: UpdatePostDto): Post {
    const post = this.getById(id);
    return Object.assign(post, { ...updatePostDto, updatedAt: new Date() });
  }

  delete(id: number): Post {
    const index = this.posts.indexOf(this.getById(id));
    const [deletedItem] = this.posts.splice(index, 1);
    return deletedItem;
  }

  getStats(userId: number): {
    stats: {
      totalPosts: number;
      lastPostDate: Date;
    };
  } {
    const posts = this.getByUser(userId);
    return {
      stats: {
        totalPosts: posts.length,
        lastPostDate: posts[posts.length - 1].createdAt,
      },
    };
  }

  getLatest(count: number): Post[] {
    return this.posts.slice(-count);
  }

  getUnpublishedByUser(userId: number): Post[] {
    return this.posts.filter(
      (post) => post.user.id === userId && !post.isPublished,
    );
  }

  publish(id: number): Post {
    const post = this.getById(id);
    post.isPublished = !post.isPublished;
    return post;
  }

  getByDate(date: string): Post[] {
    return this.posts.filter(
      (post) => post.createdAt.toISOString().split('T')[0] === date,
    );
  }
}
