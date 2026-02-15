import { PrismaClient } from '../../generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const USERS_TO_CREATE = 20;
const SUPPLIERS_TO_CREATE = 10;
const POSTS_PER_USER = 3;
const COMMENTS_PER_POST = 5;
const REVIEWS_PER_SUPPLIER = 5;

async function main() {
  console.log('🌱 Seeding community data...');

  // Create users
  const users = [];
  for (let i = 0; i < USERS_TO_CREATE; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        password: faker.internet.password(), // In a real app, hash the password
        role: 'SUPPLIER',
        isEmailVerified: true,
        company: {
          create: {
            name: faker.company.name(),
            description: faker.company.catchPhrase(),
            industry: faker.commerce.department(),
            website: faker.internet.url(),
            address: faker.location.streetAddress(),
            logoUrl: `https://picsum.photos/seed/${faker.string.uuid()}/200/200`,
            phone: faker.phone.number(),
            email: faker.internet.email(),
          },
        },
      },
      include: {
        company: true,
      },
    });
    users.push(user);
    console.log(`👤 Created user: ${user.name}`);
  }

  // Create posts and comments
  for (const user of users) {
    for (let i = 0; i < POSTS_PER_USER; i++) {
      const post = await prisma.post.create({
        data: {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(3),
          userId: user.id,
          tags: faker.helpers.arrayElements(
            ['procurement', 'supply-chain', 'logistics', 'sourcing', 'manufacturing', 'shipping'],
            { min: 1, max: 3 }
          ),
        },
      });

      console.log(`📝 Created post: ${post.title}`);

      // Create comments on the post
      const commenters = faker.helpers.arrayElements(users, { min: 1, max: COMMENTS_PER_POST });
      for (const commenter of commenters) {
        await prisma.comment.create({
          data: {
            content: faker.lorem.paragraph(),
            userId: commenter.id,
            postId: post.id,
          },
        });
      }
    }
  }

  // Create supplier reviews
  const suppliers = await prisma.company.findMany({
    take: SUPPLIERS_TO_CREATE,
  });

  for (const supplier of suppliers) {
    const reviewers = faker.helpers.arrayElements(users, { min: 1, max: REVIEWS_PER_SUPPLIER });
    
    for (const reviewer of reviewers) {
      await prisma.supplierReview.create({
        data: {
          rating: faker.number.int({ min: 1, max: 5 }),
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(2),
          userId: reviewer.id,
          supplierId: supplier.id,
          isVerified: faker.datatype.boolean(0.8), // 80% chance of being verified
        },
      });
    }

    // Update supplier rating
    const reviews = await prisma.supplierReview.findMany({
      where: { supplierId: supplier.id },
    });

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await prisma.company.update({
      where: { id: supplier.id },
      data: {
        rating: parseFloat(averageRating.toFixed(2)),
        reviewCount: reviews.length,
      },
    });

    console.log(`⭐ Updated rating for ${supplier.name}: ${averageRating.toFixed(2)} (${reviews.length} reviews)`);
  }

  // Create activity logs
  const actions = [
    'CREATE_RFQ', 'UPDATE_RFQ', 'SUBMIT_BID', 'WITHDRAW_BID', 'ACCEPT_BID',
    'REJECT_BID', 'POST_COMMENT', 'LIKE_POST', 'FOLLOW_USER', 'FOLLOW_SUPPLIER',
    'UPLOAD_DOCUMENT', 'SEND_MESSAGE', 'UPDATE_PROFILE', 'VERIFY_ACCOUNT'
  ];

  for (let i = 0; i < 100; i++) {
    const user = faker.helpers.arrayElement(users);
    const action = faker.helpers.arrayElement(actions);
    const description = getActionDescription(action, user.name);

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action,
        description,
        metadata: {},
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        createdAt: faker.date.recent({ days: 30 }),
      },
    });
  }

  console.log('✅ Community data seeded successfully!');
}

function getActionDescription(action: string, userName: string): string {
  const actions: Record<string, string> = {
    'CREATE_RFQ': `${userName} created a new RFQ`,
    'UPDATE_RFQ': `${userName} updated an RFQ`,
    'SUBMIT_BID': `${userName} submitted a bid`,
    'WITHDRAW_BID': `${userName} withdrew a bid`,
    'ACCEPT_BID': `${userName} accepted a bid`,
    'REJECT_BID': `${userName} rejected a bid`,
    'POST_COMMENT': `${userName} commented on a post`,
    'LIKE_POST': `${userName} liked a post`,
    'FOLLOW_USER': `${userName} started following a user`,
    'FOLLOW_SUPPLIER': `${userName} started following a supplier`,
    'UPLOAD_DOCUMENT': `${userName} uploaded a document`,
    'SEND_MESSAGE': `${userName} sent a message`,
    'UPDATE_PROFILE': `${userName} updated their profile`,
    'VERIFY_ACCOUNT': `${userName} verified their account`,
  };

  return actions[action] || `${userName} performed an action`;
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
