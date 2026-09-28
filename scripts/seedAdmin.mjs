import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env.local loader without third-party dependencies
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aureus_motors';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@aureusmotors.in').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AureusAdmin2026!';

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, default: 'Aureus Motors Principal' },
    role: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function runSeed() {
  console.log('[Aureus Motors] Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
  } catch {
    console.log('[Aureus Motors] Direct connection unavailable, connecting with embedded MongoDB...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mms = await MongoMemoryServer.create({
      instance: { dbName: 'aureus_motors' },
    });
    await mongoose.connect(mms.getUri());
  }

  const existingCount = await Admin.countDocuments();
  if (existingCount > 0) {
    const existing = await Admin.findOne();
    console.log(`[Aureus Motors] Admin account already exists: ${existing.email}. No duplicate created.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

  await Admin.create({
    email: ADMIN_EMAIL,
    password: hashedPassword,
    name: 'Aureus Motors Principal',
    role: 'admin',
  });

  console.log(`[Aureus Motors] Successfully created initial Admin account: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[Aureus Motors] Seed admin error:', err);
  process.exit(1);
});
