import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { employees } from '../db/schema';
import { env } from '../config/env';
import { eq } from 'drizzle-orm';

export const seedAdmin = async () => {
  try {
    console.log('--- Checking for Admin Account ---');
    
    // Check if admin already exists
    const existingAdmin = await db.select()
      .from(employees)
      .where(eq(employees.email, env.ADMIN_EMAIL))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log(`Admin account exists: ${env.ADMIN_EMAIL}`);
      return;
    }

    console.log('Seeding initial admin account...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, salt);

    await db.insert(employees).values({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      passwordHash: passwordHash,
      role: 'Admin',
      department: env.ADMIN_DEPARTMENT,
    });

    console.log(`Admin account created successfully: ${env.ADMIN_EMAIL}`);
  } catch (error) {
    console.error('Error seeding admin account:', error);
  }
};
