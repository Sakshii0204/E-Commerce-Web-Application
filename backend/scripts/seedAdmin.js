import { connectDB, disconnectDB } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { User } from '../src/models/User.js';

const seedAdmin = async () => {
  try {
    console.log('[SEED] Starting Admin seeding process...');

    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment variables');
    }

    await connectDB();

    const normalizedEmail = env.ADMIN_EMAIL.toLowerCase().trim();
    const existingAdmin = await User.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      console.log(`[SEED] Admin account already exists for ${normalizedEmail}. Updating role to ADMIN if necessary.`);
      if (existingAdmin.role !== 'ADMIN') {
        existingAdmin.role = 'ADMIN';
        await existingAdmin.save();
        console.log(`[SEED] Updated role for ${normalizedEmail} to ADMIN.`);
      }
    } else {
      await User.create({
        name: env.ADMIN_NAME || 'Admin Manager',
        email: normalizedEmail,
        password: env.ADMIN_PASSWORD,
        role: 'ADMIN'
      });
      console.log(`[SEED] Admin account created successfully for: ${normalizedEmail}`);
    }

    await disconnectDB();
    console.log('[SEED] Admin seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[SEED] Admin seeding failed:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

seedAdmin();
