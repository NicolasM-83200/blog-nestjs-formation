import { Injectable } from '@nestjs/common';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Post as PostClass, Prisma } from '@prisma/client';
import { GetPostParamsDto } from './dto/get-post-params.dto';
import { CreatePostDto } from './dto/create-post.dto';

interface CreatePostDtoWithUserId extends CreatePostDto {
  user_id: number;
}

@Injectable()
export class PostsService {
  constructor(private prismaService: PrismaService) {}

  async create(createPostDto: CreatePostDtoWithUserId): Promise<PostClass> {
    const { user_id, ...postData } = createPostDto;
    return this.prismaService.post.create({
      data: {
        ...postData,
        user: {
          connect: {
            id: user_id,
          },
        },
      },
    });
  }

  async findAll(query?: GetPostParamsDto): Promise<PostClass[]> {
    const where: Prisma.PostWhereInput = {};
    if (query.id) {
      where.id = {
        equals: Number(query.id),
      };
    }
    if (query.title) {
      where.title = {
        contains: query.title,
      };
    }
    if (query.description) {
      where.description = {
        contains: query.description,
      };
    }
    if (query.userId) {
      where.userId = {
        equals: Number(query.userId),
      };
    }
    if (query.isPublished) {
      const boolValue = String(query.isPublished) === 'true';
      where.isPublished = {
        equals: boolValue,
      };
    }
    return this.prismaService.post.findMany({
      where,
      include: { user: { select: { firstname: true, lastname: true } } },
    });
  }

  async findOne(id: number): Promise<PostClass> {
    return this.prismaService.post.findUnique({
      where: { id },
      include: {
        user: { select: { firstname: true, lastname: true } },
        likes: {
          select: { user: { select: { firstname: true, lastname: true } } },
        },
      },
    });
  }

  async findByUser(userId: number): Promise<PostClass[]> {
    return this.prismaService.post.findMany({
      where: { userId },
      include: { user: { select: { firstname: true, lastname: true } } },
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostClass> {
    return this.prismaService.post.update({
      where: { id },
      data: { ...updatePostDto },
      include: { user: { select: { firstname: true, lastname: true } } },
    });
  }

  async delete(id: number): Promise<PostClass> {
    // Utilisation d'une transaction pour garantir la cohérence des données
    return this.prismaService.$transaction(async (tx) => {
      // Suppression des likes liés au post
      await tx.like.deleteMany({
        where: { postId: id },
      });
      // Suppression du post
      return tx.post.delete({
        where: { id },
        include: { user: { select: { firstname: true, lastname: true } } },
      });
    });
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
      include: { user: { select: { firstname: true, lastname: true } } },
    });
  }

  async findUnpublishedByUser(userId: number): Promise<PostClass[]> {
    return this.prismaService.post.findMany({
      where: {
        userId,
        isPublished: false,
      },
      include: { user: { select: { firstname: true, lastname: true } } },
    });
  }

  async publish(id: number): Promise<PostClass> {
    const post = await this.findOne(id);
    const updatedPost = await this.prismaService.post.update({
      where: { id },
      data: { isPublished: !post.isPublished },
      include: { user: { select: { firstname: true, lastname: true } } },
    });
    return { ...updatedPost, isPublished: updatedPost.isPublished };
  }

  async toggleLike(postId: number, userId: number): Promise<PostClass> {
    // Vérifier si l'utilisateur a déjà liké le post
    const existingLike = await this.prismaService.like.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });
    // Utiliser une transaction pour garantir la cohérence des données
    return this.prismaService.$transaction(async (tx) => {
      if (existingLike) {
        // Si le like existe, on le supprime et on décrémente le compteur
        await tx.like.delete({
          where: {
            userId_postId: {
              userId: userId,
              postId: postId,
            },
          },
        });
        return tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
          include: { user: { select: { firstname: true, lastname: true } } },
        });
      } else {
        // Si le like n'existe pas, on le crée et on incrémente le compteur
        await tx.like.create({
          data: {
            userId: userId,
            postId: postId,
          },
        });
        return tx.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
          include: { user: { select: { firstname: true, lastname: true } } },
        });
      }
    });
  }

  async findByDate(date: string): Promise<PostClass[]> {
    return this.prismaService.post.findMany({
      where: {
        createdAt: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: { user: { select: { firstname: true, lastname: true } } },
    });
  }

  async findMostPopular(viewCount: number): Promise<PostClass[]> {
    return this.prismaService.post.findMany({
      where: { viewCount: { gte: viewCount } },
      orderBy: { viewCount: 'desc' },
      include: { user: { select: { firstname: true, lastname: true } } },
    });
  }
}
