import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = "changeme123";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });

  const general = await prisma.forum.upsert({
    where: { slug: "general" },
    update: {},
    create: {
      name: "General",
      slug: "general",
      description: "Announcements and community-wide discussion.",
      order: 0,
    },
  });

  await prisma.forum.upsert({
    where: { slug: "general-announcements" },
    update: {},
    create: {
      name: "Announcements",
      slug: "general-announcements",
      description: "Official news from the admins.",
      parentId: general.id,
      order: 0,
    },
  });

  await prisma.forum.upsert({
    where: { slug: "general-introductions" },
    update: {},
    create: {
      name: "Introductions",
      slug: "general-introductions",
      description: "New here? Say hello.",
      parentId: general.id,
      order: 1,
    },
  });

  const community = await prisma.forum.upsert({
    where: { slug: "community" },
    update: {},
    create: {
      name: "Community",
      slug: "community",
      description: "Everything else, organized by topic.",
      order: 1,
    },
  });

  await prisma.forum.upsert({
    where: { slug: "community-classifieds" },
    update: {},
    create: {
      name: "Classifieds",
      slug: "community-classifieds",
      description: "Buy, sell, and trade.",
      parentId: community.id,
      order: 0,
    },
  });

  const thread = await prisma.thread.upsert({
    where: { forumId_slug: { forumId: general.id, slug: "welcome-to-the-commons" } },
    update: {},
    create: {
      title: "Welcome to The Commons",
      slug: "welcome-to-the-commons",
      forumId: general.id,
      authorId: admin.id,
      pinned: true,
      posts: {
        create: {
          authorId: admin.id,
          content:
            "This is the seeded starter thread. Head to Manage (admin only) to add your own main forums and subforums, or delete this example content once you're set up.",
        },
      },
    },
  });

  console.log("Seeded. Admin login:", adminEmail, "/", adminPassword);
  console.log("Starter thread id:", thread.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
