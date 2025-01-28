import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Post as PostClass } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prismaService: PrismaService) {}

  async create(createPostDto: CreatePostDto): Promise<PostClass> {
    const { userId, ...rest } = createPostDto;
    return this.prismaService.post.create({
      data: {
        ...rest,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async findAll(query?: { [key: string]: string }): Promise<PostClass[]> {
    if (!query || Object.keys(query).length === 0) {
      return this.prismaService.post.findMany({
        include: { user: true },
      });
    }
    return this.prismaService.post.findMany({
      where: {
        OR: Object.entries(query).map(([key, value]) => ({
          [key]: { contains: value },
        })),
      },
      include: { user: true },
    });
  }

  async findOne(id: number): Promise<PostClass> {
    return this.prismaService.post.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByUser(userId: number): Promise<PostClass[]> {
    const posts = await this.prismaService.post.findMany({
      where: { userId },
      include: { user: true },
    });
    return posts.map((post) => post);
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostClass> {
    const post = await this.prismaService.post.update({
      where: { id },
      data: { ...updatePostDto, updatedAt: new Date() },
      include: { user: true },
    });
    return post;
  }

  async delete(id: number): Promise<PostClass> {
    const post = await this.prismaService.post.delete({
      where: { id },
      include: { user: true },
    });
    return post;
  }

  async findStats(userId: number): Promise<{
    totalPosts: number;
    lastPostDate: Date;
  }> {
    const posts = await this.findByUser(userId);
    return {
      totalPosts: posts.length,
      lastPostDate: posts[posts.length - 1].createdAt,
    };
  }

  async findLatest(count: number): Promise<PostClass[]> {
    return this.prismaService.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: count,
      include: { user: true },
    });
  }

  async findUnpublishedByUser(userId: number): Promise<PostClass[]> {
    return this.prismaService.post.findMany({
      where: {
        userId,
        isPublished: false,
      },
      include: { user: true },
    });
  }

  async publish(id: number): Promise<PostClass> {
    const post = await this.findOne(id);
    const updatedPost = await this.prismaService.post.update({
      where: { id },
      data: { isPublished: !post.isPublished },
      include: { user: true },
    });
    return { ...updatedPost, isPublished: updatedPost.isPublished };
  }

  async findByDate(date: string): Promise<PostClass[]> {
    return this.prismaService.post.findMany({
      where: {
        createdAt: {
          equals: new Date(date),
        },
      },
      include: { user: true },
    });
  }
}
