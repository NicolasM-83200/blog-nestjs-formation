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
import { Post as PostClass } from 'src/post.class';
import { UsersService } from 'src/users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto): {
    message: string;
    post: PostClass;
  } {
    const user = this.usersService.getById(createPostDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'Post created successfully',
      post: this.postsService.create(createPostDto, user),
    };
  }

  @Get()
  getAll(@Query() query: { [key: string]: string }): {
    message: string;
    posts: PostClass[];
  } {
    return {
      message:
        Object.keys(query).length === 0
          ? 'All posts fetched successfully'
          : `Posts filtered by ${Object.entries(query)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')}`,
      posts: this.postsService.getAll(query),
    };
  }

  @Get('/latest')
  getLatest(@Query('count', ParseIntPipe) count: number): {
    message: string;
    posts: PostClass[];
  } {
    return {
      message: 'Latest posts fetched successfully',
      posts: this.postsService.getLatest(count),
    };
  }

  @Get('/unpublished/byUser/:userId')
  getUnpublishedPostsByUser(@Param('userId', ParseIntPipe) userId: number): {
    message: string;
    posts: PostClass[];
  } {
    return {
      message: 'Unpublished posts fetched successfully',
      posts: this.postsService.getUnpublishedByUser(userId),
    };
  }

  @Get('/byDate/:date')
  getByDate(@Param('date') date: string): {
    message: string;
    posts: PostClass[];
  } {
    return {
      message: `${this.postsService.getByDate(date).length === 0 ? 'No posts found for date: ' + date : 'Posts fetched by date of ' + date + ' successfully'}`,
      posts: this.postsService.getByDate(date),
    };
  }

  @Get('/byUser/:userId/stats')
  getStats(@Param('userId', ParseIntPipe) userId: number): {
    message: string;
    stats: {
      totalPosts: number;
      lastPostDate: Date;
    };
  } {
    if (!this.usersService.getById(userId)) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `Posts stats for user with id: ${userId}`,
      stats: this.postsService.getStats(userId).stats,
    };
  }

  @Get('/byUser/:userId/posts')
  getByUser(@Param('userId', ParseIntPipe) userId: number): {
    message: string;
    posts: PostClass[];
  } {
    if (!this.usersService.getById(userId)) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `Posts fetched by user with id: ${userId}`,
      posts: this.postsService.getByUser(userId),
    };
  }

  @Get('/:id')
  getById(@Param('id', ParseIntPipe) id: number): {
    message: string;
    post: PostClass;
  } {
    if (!this.postsService.getById(id)) {
      throw new NotFoundException('Post not found');
    }
    return {
      message: 'Post fetched successfully',
      post: this.postsService.getById(id),
    };
  }

  @Put('/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): { message: string; post: PostClass } {
    if (!this.postsService.getById(id)) {
      throw new NotFoundException('Post not found');
    }
    return {
      message: 'Post updated successfully',
      post: this.postsService.update(id, updatePostDto),
    };
  }

  @Patch('/:id/publish')
  publish(@Param('id', ParseIntPipe) id: number): {
    message: string;
    post: PostClass;
  } {
    if (!this.postsService.getById(id)) {
      throw new NotFoundException('Post not found');
    }
    return {
      message: `Post ${this.postsService.getById(id).isPublished ? 'unpublished' : 'published'}`,
      post: this.postsService.publish(id),
    };
  }

  @Delete('/:id')
  delete(@Param('id', ParseIntPipe) id: number): {
    message: string;
    post: PostClass;
  } {
    if (!this.postsService.getById(id)) {
      throw new NotFoundException('Post not found');
    }
    return {
      message: 'Post deleted successfully',
      post: this.postsService.delete(id),
    };
  }
}
