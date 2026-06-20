import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@matsols.com";
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const role = "ADMIN";
  if (!password || password.length < 12) {
    throw new Error(
      "BOOTSTRAP_ADMIN_PASSWORD is required and must be at least 12 characters.",
    );
  }

  console.log(`🚀 Creating default admin user: ${email}...`);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword, role },
      create: {
        email,
        password: hashedPassword,
        role,
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log(`📧 Email: ${email}`);
    console.log("🔑 Password: [provided via BOOTSTRAP_ADMIN_PASSWORD]");
  } catch (error) {
    console.error("❌ Failed to create admin user:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
