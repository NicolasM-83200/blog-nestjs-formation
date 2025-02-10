import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

export function generateUser(count: number): Prisma.UserCreateManyInput[] {
  const users: Prisma.UserCreateManyInput[] = [];
  for (let i = 0; i < count; i++) {
    users.push({
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
    });
  }
  return users;
}

export function generatePost(
  count: number,
  userId: number,
): Prisma.PostCreateManyInput[] {
  const posts: Prisma.PostCreateManyInput[] = [];
  for (let i = 0; i < count; i++) {
    posts.push({
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      isPublished: faker.datatype.boolean(),
      viewCount: faker.number.int({ min: 1, max: 1000 }),
      userId: userId,
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
    });
  }
  return posts;
}
