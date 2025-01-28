import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { UsersService } from 'src/users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostClass } from '@prisma/client';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto): Promise<{
    message: string;
    post: PostClass;
  }> {
    const user = await this.usersService.findOne(createPostDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'Post created successfully',
      post: await this.postsService.create(createPostDto),
    };
  }

  @Get()
  async findAll(@Query() query: { [key: string]: string }): Promise<{
    message: string;
    posts: PostClass[];
  }> {
    return {
      message:
        Object.keys(query).length === 0
          ? 'All posts fetched successfully'
          : `Posts filtered by ${Object.entries(query)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')}`,
      posts: await this.postsService.findAll(query),
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
    const user = await this.usersService.findOne(userId);
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
    const user = await this.usersService.findOne(userId);
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
  ): Promise<{ message: string; post: PostClass }> {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return {
      message: 'Post updated successfully',
      post: await this.postsService.update(id, updatePostDto),
    };
  }

  @Patch('/:id/publish')
  async publish(@Param('id', ParseIntPipe) id: number): Promise<{
    message: string;
    post: PostClass;
  }> {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return {
      message: `Post ${post.isPublished ? 'unpublished' : 'published'}`,
      post: await this.postsService.publish(id),
    };
  }

  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{
    message: string;
    post: PostClass;
  }> {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return {
      message: 'Post deleted successfully',
      post: await this.postsService.delete(id),
    };
  }
}
