import 'dotenv/config';
import mongoose from 'mongoose';
import AdminUser from '../models/AdminUser';
import MetadataModel from '../models/Metadata';
import Profile from '../models/Profile';

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not defined in .env.local');
    process.exit(1);
  }

  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // 1. Admin User Setup
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await AdminUser.findOne({ email: adminEmail });
    if (!admin) {
      admin = new AdminUser({
        email: adminEmail,
        password: adminPassword,
      });
      await admin.save();
      console.log(`✅ Admin user created successfully: ${adminEmail}`);
    } else {
      console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
    }

    // 2. Default Website Metadata Setup
    let metadata = await MetadataModel.findById('site_metadata');
    if (!metadata) {
      metadata = await MetadataModel.create({
        _id: 'site_metadata',
        title: 'Portfolio & Admin CMS',
        description: 'Modern full-stack portfolio built with Next.js 15, TypeScript, MongoDB, and Tailwind CSS.',
        keywords: ['portfolio', 'web developer', 'full stack', 'nextjs', 'react'],
        icons: {
          icon: '',
          shortcut: '',
          apple: '',
        },
        openGraph: {
          title: 'Portfolio & Admin CMS',
          description: 'Modern full-stack portfolio built with Next.js 15, TypeScript, MongoDB, and Tailwind CSS.',
          type: 'website',
        },
        logos: {
          navbarLogo: '',
          bannerLogo: '',
        },
        cursorUrl: '',
        showDateTime: true,
      });
      console.log('✅ Default website metadata initialized.');
    } else {
      console.log('ℹ️ Website metadata already exists.');
    }

    // 3. Default Profile Setup
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({
        name: 'Developer',
        intro: 'Full-Stack Web Developer',
        about: 'Passionate about building fast, responsive, and aesthetically stunning web applications.',
        photoUrl: '',
        cvUrl: '',
        skills: ['Next.js', 'React', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS'],
      });
      console.log('✅ Default profile initialized.');
    } else {
      console.log('ℹ️ Profile already exists.');
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
