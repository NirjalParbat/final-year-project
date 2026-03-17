/**
 * One-time migration: mark all pre-existing users as email-verified.
 *
 * Required after the auth security refactor that introduced the
 * isEmailVerified field (default false). Without this, all existing
 * accounts would be locked out.
 *
 * Usage:
 *   node server/utils/migrateEmailVerified.js
 *
 * Safe to run multiple times (only updates documents where the field
 * does not yet exist or is false).
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not set in server/.env');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connected to MongoDB');

const result = await mongoose.connection.db
  .collection('users')
  .updateMany(
    { isEmailVerified: { $ne: true } },
    { $set: { isEmailVerified: true } }
  );

console.log(`✅ Migration complete — ${result.modifiedCount} user(s) updated.`);
await mongoose.disconnect();
