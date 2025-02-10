import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { UsersService } from 'src/users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostClass, Role } from '@prisma/client';
import { GetPostParamsDto } from './dto/get-post-params.dto';
import { CustomHttpException } from 'src/exceptions/customhttp.exception';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    sub: number;
    role: Role;
  };
}

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: RequestWithUser,
  ): Promise<{
    message: string;
    post: PostClass;
  }> {
    // Récupération de l'utilisateur par l'id récupéré dans l'objet req
    const user = await this.usersService.findOneById(req.user.sub);
    if (!user) {
      throw new CustomHttpException(
        "Pas de users trouvé avec l'id: " + req.user.sub,
        HttpStatus.NOT_FOUND,
        'PC-c-1',
      );
    }
    return {
      message: 'Post created successfully',
      post: await this.postsService.create({
        ...createPostDto,
        user_id: user.id,
      }),
    };
  }

  @Get()
  async findAll(@Query() query: GetPostParamsDto): Promise<{
    message: string;
    posts: PostClass[];
  }> {
    return {
      message:
        // Si aucun filtre n'est appliqué, on affiche tous les posts
        Object.keys(query).length === 0
          ? 'All posts fetched successfully'
          : `Posts filtered by ${Object.entries(query)
              // On transforme les entrées en chaine de caractères
              .map(([key, value]) => `${key}: ${value}`)
              // On joint les entrées avec une virgule
              .join(', ')}`,
      posts: await this.postsService.findAll(query),
    };
  }

  @Get('/mostPopular')
  async findMostPopular(
    @Query('viewCount', ParseIntPipe) viewCount: number,
  ): Promise<{
    message: string;
    posts: PostClass[];
  }> {
    return {
      message: 'Most popular posts fetched successfully',
      posts: await this.postsService.findMostPopular(viewCount),
    };
  }

  @Get('/latest')
  async findLatest(@Query('count', ParseIntPipe) count: number): Promise<{
    message: string;
    posts: PostClass[];
  }> {
    return {
      message: 'Latest posts fetched successfully',
      posts: await this.postsService.findLatest(count),
    };
  }

  @Get('/unpublished/byUser/:userId')
  async findUnpublishedPostsByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{
    message: string;
    posts: PostClass[];
  }> {
    return {
      message: 'Unpublished posts fetched successfully',
      posts: await this.postsService.findUnpublishedByUser(userId),
    };
  }

  @Get('/byDate/:date')
  async findByDate(@Param('date') date: string): Promise<{
    message: string;
    posts: PostClass[];
  }> {
    const posts = await this.postsService.findByDate(date);
    return {
      message: `${posts.length === 0 ? 'No posts found for date: ' + date : 'Posts fetched by date of ' + date + ' successfully'}`,
      posts,
    };
  }

  @Get('/byUser/:userId/stats')
  async findStats(@Param('userId', ParseIntPipe) userId: number): Promise<{
    message: string;
    stats: {
      totalPosts: number;
      lastPostDate: Date;
    };
  }> {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `Posts stats for user with id: ${userId}`,
      stats: await this.postsService.findStats(userId),
    };
  }

  @Get('/byUser/:userId/posts')
  async findByUser(@Param('userId', ParseIntPipe) userId: number): Promise<{
    message: string;
    posts: PostClass[];
  }> {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `Posts fetched by user with id: ${userId}`,
      posts: await this.postsService.findByUser(userId),
    };
  }

  @Get('/:id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<{
    message: string;
    post: PostClass;
  }> {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return {
      message: 'Post fetched successfully',
      post,
    };
  }

  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; post: PostClass }> {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    // Si l'utilisateur n'est pas admin et que l'utilisateur n'est pas le créateur du post, on renvoie une erreur
    if (req.user.role !== Role.admin && post.userId !== req.user.sub) {
      throw new CustomHttpException(
        'You are not allowed to update this post',
        HttpStatus.FORBIDDEN,
        'PC-u-1',
      );
    }
    return {
      message: 'Post updated successfully',
      post: await this.postsService.update(id, updatePostDto),
    };
  }

  @Patch('/:id/publish')
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ): Promise<{
    message: string;
    post: PostClass;
  }> {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    // Si l'utilisateur n'est pas admin et que l'utilisateur n'est pas le créateur du post, on renvoie une erreur
    if (req.user.role !== Role.admin && post.userId !== req.user.sub) {
      throw new CustomHttpException(
        'You are not allowed to publish this post',
        HttpStatus.FORBIDDEN,
        'PC-p-1',
      );
    }
    return {
      message: `Post ${post.isPublished ? 'unpublished' : 'published'}`,
      post: await this.postsService.publish(id),
    };
  }

  @Post('/:id/like')
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ): Promise<{
    message: string;
    post: PostClass;
  }> {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return {
      message: 'Post liked successfully',
      post: await this.postsService.toggleLike(id, req.user.sub),
    };
  }

  @Delete('/:id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ): Promise<{
    message: string;
    post: PostClass;
  }> {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    // Si l'utilisateur n'est pas admin et que l'utilisateur n'est pas le créateur du post, on renvoie une erreur
    if (req.user.role !== Role.admin && post.userId !== req.user.sub) {
      throw new CustomHttpException(
        'You are not allowed to delete this post',
        HttpStatus.FORBIDDEN,
        'PC-d-1',
      );
    }
    return {
      message: 'Post deleted successfully',
      post: await this.postsService.delete(id),
    };
  }
}
