import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

async function run() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!');

  const { default: Profile } = await import('../models/Profile');

  await Profile.findOneAndUpdate({}, { cvUrl: '/Sujoy_Kumar_Mondal_CV.pdf' });
  console.log('✅ Profile updated in MongoDB with cvUrl: /Sujoy_Kumar_Mondal_CV.pdf');

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('❌ Update failed:', err);
  process.exit(1);
});
