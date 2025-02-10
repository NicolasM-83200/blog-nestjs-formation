import { Like, Post, Prisma, PrismaClient, User } from '@prisma/client';
import { fakerFR as faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
async function main() {
  const users = await createUser(5);
  const posts = await createPost(5, users);
  await createLikesForPosts(posts, users);
}

const createUser = async (count: number): Promise<User[]> => {
  const users: User[] = [];
  while (count > 0) {
    users.push(
      await prisma.user.create({
        data: {
          firstname: faker.person.firstName(),
          lastname: faker.person.lastName(),
          email: faker.internet.email(),
          password: await bcrypt.hash(faker.internet.password(), 3),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      }),
    );
    count--;
  }
  return prisma.user.findMany();
};

const createPost = async (count: number, users: User[]): Promise<Post[]> => {
  const posts: Prisma.PostCreateManyInput[] = [];
  for (const user of users) {
    for (let i = 0; i < count; i++) {
      posts.push({
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        isPublished: faker.datatype.boolean(),
        viewCount: faker.number.int({ min: 1, max: 1000 }),
        likeCount: faker.number.int({ min: 1, max: 1000 }),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        userId: user.id,
      });
    }
  }
  await prisma.post.createMany({
    data: posts,
    skipDuplicates: true,
  });

  return prisma.post.findMany();
};

const createLikesForPosts = async (
  posts: Post[],
  users: User[],
): Promise<Like[]> => {
  const likesData: Like[] = [];

  for (const post of posts) {
    const userIdsWhoLiked = new Set<number>();

    // Génère un nombre aléatoire de likes (entre 1 et 5 pour ce post)
    const numberOfLikes = faker.number.int({ min: 1, max: 5 });

    while (userIdsWhoLiked.size < numberOfLikes) {
      const randomUserId = users[Math.floor(Math.random() * users.length)].id;
      userIdsWhoLiked.add(randomUserId); // Ajoute l'utilisateur à l'ensemble
    }

    // Ajoute les likes au tableau
    userIdsWhoLiked.forEach((userId) => {
      likesData.push({
        userId: userId,
        postId: post.id,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      });
    });
  }

  // Insère tous les likes en une seule fois
  await prisma.like.createMany({
    data: likesData,
    skipDuplicates: true, // Évite les doublons
  });

  return prisma.like.findMany();
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
