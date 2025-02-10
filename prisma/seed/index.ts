import { Like, Post, Prisma, PrismaClient, User } from '@prisma/client';
import { fakerFR as faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
async function main() {
  const users = await createUser(5);
  const posts = await createPost(5, users);
  await createLikesForPosts(posts, users);
}

/**
 * Création d'utilisateurs
 * @param count - Nombre d'utilisateurs à créer
 * @returns Promise<User[]> - Utilisateurs créés
 */
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

/**
 * Création de posts
 * @param count - Nombre de posts à créer
 * @param users - Utilisateurs existants
 * @returns Promise<Post[]> - Posts créés
 */
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

/**
 * Création de likes pour les posts
 * @param posts - Posts existants
 * @param users - Utilisateurs existants
 * @returns Promise<Like[]> - Likes créés
 */
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
      // Tant que le nombre de likes n'est pas atteint
      const randomUserId = users[Math.floor(Math.random() * users.length)].id; // Génère un utilisateur aléatoire
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

/**
 * Fonction principale pour exécuter le seed
 * @returns Promise<void> - Seed exécuté
 */
main()
  /**
   * Déconnexion de la base de données
   * @returns Promise<void> - Déconnexion de la base de données
   * pour éviter les erreurs de connexion
   */
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
