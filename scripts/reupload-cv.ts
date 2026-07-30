import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

async function run() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!');

  const { uploadToCloudinary } = await import('../lib/cloudinary');
  const { default: Profile } = await import('../models/Profile');

  const cvPath = path.resolve('..', 'assets', 'Documents', 'CV-Sujoy Kumar Mondal.pdf');
  if (fs.existsSync(cvPath)) {
    console.log('📄 Re-uploading CV as PDF image asset (Sujoy_Kumar_Mondal_CV.pdf)...');
    const buffer = fs.readFileSync(cvPath);
    const cvUrl = await uploadToCloudinary(buffer, 'cv', 'image', 'Sujoy_Kumar_Mondal_CV');
    console.log(`✅ New Viewable CV URL: ${cvUrl}`);

    await Profile.findOneAndUpdate({}, { cvUrl });
    console.log('✅ Profile updated in MongoDB with new PDF URL!');
  } else {
    console.error('❌ CV file not found');
  }

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('❌ CV re-upload failed:', err);
  process.exit(1);
});
