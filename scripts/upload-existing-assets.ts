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
  const { default: Project } = await import('../models/Project');

  console.log('\n🚀 Uploading existing assets to Cloudinary...\n');

  // 1. Upload Profile Photo
  const sujoyPhotoPath = path.resolve('..', 'assets', 'images', 'Sujoy.png');
  let photoUrl = '';
  if (fs.existsSync(sujoyPhotoPath)) {
    console.log('📸 Uploading Profile Photo (Sujoy.png)...');
    const buffer = fs.readFileSync(sujoyPhotoPath);
    photoUrl = await uploadToCloudinary(buffer, 'profile', 'image');
    console.log(`✅ Profile Photo URL: ${photoUrl}`);
  } else {
    console.log(`⚠️ Profile photo not found at ${sujoyPhotoPath}`);
  }

  // 2. Upload CV PDF
  const cvPath = path.resolve('..', 'assets', 'Documents', 'CV-Sujoy Kumar Mondal.pdf');
  let cvUrl = '';
  if (fs.existsSync(cvPath)) {
    console.log('📄 Uploading CV (CV-Sujoy Kumar Mondal.pdf)...');
    const buffer = fs.readFileSync(cvPath);
    cvUrl = await uploadToCloudinary(buffer, 'cv', 'raw');
    console.log(`✅ CV URL: ${cvUrl}`);
  } else {
    console.log(`⚠️ CV not found at ${cvPath}`);
  }

  // 3. Upload Custom Cursor
  const cursorPath = path.resolve('..', 'Custom-Cursor-Css', '1.png');
  let cursorUrl = '';
  if (fs.existsSync(cursorPath)) {
    console.log('🖱️ Uploading Custom Cursor (1.png)...');
    const buffer = fs.readFileSync(cursorPath);
    cursorUrl = await uploadToCloudinary(buffer, 'cursor', 'image');
    console.log(`✅ Cursor URL: ${cursorUrl}`);
  } else {
    console.log(`⚠️ Cursor not found at ${cursorPath}`);
  }

  // Update Profile document
  const profileUpdate: Record<string, string> = {};
  if (photoUrl) profileUpdate.photoUrl = photoUrl;
  if (cvUrl) profileUpdate.cvUrl = cvUrl;
  if (cursorUrl) profileUpdate.cursorUrl = cursorUrl;

  if (Object.keys(profileUpdate).length > 0) {
    await Profile.findOneAndUpdate({}, profileUpdate, { upsert: true });
    console.log('✅ Profile document updated in MongoDB');
  }

  // 4. Upload Project 1 Image (Portfolio.png)
  const portfolioImgPath = path.resolve('..', 'assets', 'Projects', 'Portfolio.png');
  let portfolioImgUrl = '';
  if (fs.existsSync(portfolioImgPath)) {
    console.log('💼 Uploading Project Image (Portfolio.png)...');
    const buffer = fs.readFileSync(portfolioImgPath);
    portfolioImgUrl = await uploadToCloudinary(buffer, 'projects', 'image');
    console.log(`✅ Portfolio Project Image URL: ${portfolioImgUrl}`);

    await Project.findOneAndUpdate(
      { slug: 'sujoy-kr-mondal' },
      { mainImage: portfolioImgUrl }
    );
    console.log('✅ "sujoy-kr-mondal" project updated');
  }

  // 5. Upload Project 2 Image (YouTube.png + screenshots)
  const youtubeImgPath = path.resolve('..', 'assets', 'Projects', 'YouTube.png');
  let youtubeImgUrl = '';
  if (fs.existsSync(youtubeImgPath)) {
    console.log('💼 Uploading Project Image (YouTube.png)...');
    const buffer = fs.readFileSync(youtubeImgPath);
    youtubeImgUrl = await uploadToCloudinary(buffer, 'projects', 'image');
    console.log(`✅ YouTube Project Image URL: ${youtubeImgUrl}`);
  }

  // Upload YouTube gallery screenshots
  const newFolder = path.resolve('..', 'assets', 'images', 'New folder');
  const galleryUrls: string[] = [];
  if (fs.existsSync(newFolder)) {
    const files = fs.readdirSync(newFolder).filter(f => f.endsWith('.png'));
    for (const file of files) {
      console.log(`🖼️ Uploading gallery image (${file})...`);
      const buffer = fs.readFileSync(path.join(newFolder, file));
      const url = await uploadToCloudinary(buffer, 'projects', 'image');
      galleryUrls.push(url);
      console.log(`  └─ ${url}`);
    }
  }

  if (youtubeImgUrl || galleryUrls.length > 0) {
    const youtubeUpdate: Record<string, unknown> = {};
    if (youtubeImgUrl) youtubeUpdate.mainImage = youtubeImgUrl;
    if (galleryUrls.length > 0) youtubeUpdate.images = galleryUrls;

    await Project.findOneAndUpdate({ slug: 'arohi-lyrics' }, youtubeUpdate);
    console.log('✅ "arohi-lyrics" project updated with main image & gallery screenshots');
  }

  await mongoose.disconnect();
  console.log('\n🎉 All images successfully uploaded to Cloudinary and database updated!\n');
}

run().catch(err => {
  console.error('❌ Asset upload failed:', err);
  process.exit(1);
});
