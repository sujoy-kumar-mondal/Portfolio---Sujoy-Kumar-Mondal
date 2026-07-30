import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!');

  // Dynamic imports after connection
  const { default: AdminUser } = await import('../models/AdminUser');
  const { default: Profile } = await import('../models/Profile');
  const { default: SocialLink } = await import('../models/SocialLink');
  const { default: Project } = await import('../models/Project');
  const { default: ContactInfo } = await import('../models/ContactInfo');

  // ── Admin User ──
  let admin = await AdminUser.findOne({ email: 'sujoy721642@gmail.com' });
  if (!admin) {
    admin = await AdminUser.create({ email: 'sujoy721642@gmail.com', password: 'Sujoy@2003' });
    console.log('✅ Admin user created: sujoy721642@gmail.com / Sujoy@2003');
  } else {
    admin.password = 'Sujoy@2003';
    await admin.save();
    console.log('✅ Admin user updated: sujoy721642@gmail.com / Sujoy@2003');
  }

  // ── Profile ──
  const existingProfile = await Profile.findOne();
  if (!existingProfile) {
    await Profile.create({
      name: 'Sujoy Kumar Mondal',
      intro: 'I am a Web Developer',
      about: 'I am a software developer and web designer from Purba Medinipur, currently pursuing a Bachelor of Computer Applications (BCA) at Brainware University. Throughout my academic journey, I have gained proficiency in programming languages such as Python, Java, and C, as well as markup languages like HTML and CSS. I am committed to further enhancing my skills and plan to pursue a Master of Computer Applications (MCA) after completing my BCA.',
      photoUrl: '',
      cvUrl: '',
      cursorUrl: '',
      skills: ['#python', '#tailwind-css', '#css', '#javascript', '#figma', '#c', '#html', '#dbms'],
    });
    console.log('✅ Profile seeded');
  } else {
    console.log('ℹ️  Profile already exists');
  }

  // ── Social Links ──
  const socialCount = await SocialLink.countDocuments();
  if (socialCount === 0) {
    await SocialLink.insertMany([
      {
        platform: 'LinkedIn', url: 'https://www.linkedin.com/in/sujoy-kumar-mondal/', hoverColor: '#0077B5', order: 0, isActive: true,
        svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24"><path fill="currentColor" d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z"/></svg>',
      },
      {
        platform: 'X', url: 'https://x.com/Sujoy721642', hoverColor: '#ffffff', order: 1, isActive: true,
        svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24"><path fill="currentColor" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>',
      },
      {
        platform: 'Instagram', url: 'https://www.instagram.com/ordinary_boy_sujoy/', hoverColor: '#E1306C', order: 2, isActive: true,
        svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24"><path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>',
      },
      {
        platform: 'Email', url: 'mailto:sujoy721642@gmail.com', hoverColor: '#4285F4', order: 3, isActive: true,
        svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24"><path fill="currentColor" d="M64 112c-8.8 0-16 7.2-16 16v22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1V128c0-8.8-7.2-16-16-16H64zM48 212.2V384c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V212.2L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64H448c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/></svg>',
      },
      {
        platform: 'GitHub', url: 'https://github.com/Sujoy721642', hoverColor: '#4078c0', order: 4, isActive: true,
        svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" width="24" height="24"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"/></svg>',
      },
      {
        platform: 'YouTube', url: 'https://www.youtube.com/c/ArohiLyrics', hoverColor: '#FF0000', order: 5, isActive: true,
        svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="24" height="24"><path fill="currentColor" d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/></svg>',
      },
    ]);
    console.log('✅ Social links seeded (6 links)');
  } else {
    console.log('ℹ️  Social links already exist');
  }

  // ── Projects ──
  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.insertMany([
      {
        name: 'Sujoy Kr. Mondal',
        slug: 'sujoy-kr-mondal',
        category: 'Portfolio',
        shortDescription: [{ text: 'SKM is my Portfolio Website that is introduce my-self for recruiters. Built custom animated Website. Builted the complete site using HTML, Tailwind CSS, and JS.' }],
        description: [{ text: 'SKM is my Portfolio Website that is introduce my-self for recruiters. Built custom animated Website. Builted the complete site using HTML, Tailwind CSS, and JS. This portfolio showcases all my projects, skills, and contact information.' }],
        mainImage: '',
        images: [],
        projectUrl: '',
        tags: ['#node.js', '#tailwind-css', '#css', '#javascript', '#figma'],
        features: ['Responsive Design', 'Animated background', 'Project showcase', 'Contact form', 'Social media links'],
        workingPrinciple: 'Built using HTML, Tailwind CSS for styling, and vanilla JavaScript for interactivity including the particle canvas animation.',
        accentColor: '#5292ff',
        order: 0,
        isActive: true,
      },
      {
        name: 'Arohi Lyrics',
        slug: 'arohi-lyrics',
        category: 'YouTube',
        shortDescription: [
          { text: 'Hi visitor, I edit and upload various entertainment videos and festival videos on my YouTube channel. You can go to my channel and ' },
          { text: 'watch', url: 'https://www.youtube.com/watch?v=xv74YjxilNs' },
          { text: ' videos. I am a video editor and also a YT channel manager.' },
        ],
        description: [
          { text: 'Arohi Lyrics is my YouTube channel where I create and publish various entertainment and festival videos. As a video editor and YouTube channel manager, I bring creative content to thousands of subscribers. Check out the channel for high-quality video content.' },
        ],
        mainImage: '',
        images: [],
        projectUrl: 'https://www.youtube.com/c/ArohiLyrics',
        tags: ['#videoediting', '#videography', '#photography', '#videoproduction', '#photoediting', '#filmmaking', '#youtubevideos', '#videomarketing'],
        features: ['Entertainment videos', 'Festival content', 'High-quality editing', 'Regular uploads', 'Community engagement'],
        workingPrinciple: '',
        accentColor: '#ff700e',
        order: 1,
        isActive: true,
      },
    ]);
    console.log('✅ Projects seeded (2 projects)');
  } else {
    console.log('ℹ️  Projects already exist');
  }

  // ── Contact Info ──
  const contactCount = await ContactInfo.countDocuments();
  if (contactCount === 0) {
    await ContactInfo.create({
      address: 'Vill: - Baruna, P.S: - Moyna, Dist: - Purba Medinipur, State: - WB, Pin: - 721642',
      addressMapUrl: 'https://maps.app.goo.gl/668Rvgm9yXq5BUtr9',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8872.90935012639!2d87.77977312305684!3d22.169528014843788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02c12ecd73238b%3A0xdd9cd74185ed78a2!2sBaruna%20Manasamata%20Mandir!5e0!3m2!1sen!2sin!4v1737811517209!5m2!1sen!2sin',
      phone: '+91 9002842851',
      email: 'sujoy721642@gmail.com',
      contactFormRecipient: 'sujoy721642@gmail.com',
      getInTouchTitle: 'Get in Touch',
      letsMeetTitle: "Let's Meet",
    });
    console.log('✅ Contact info seeded');
  } else {
    console.log('ℹ️  Contact info already exists');
  }

  await mongoose.disconnect();
  console.log('\n🎉 Seed complete! Your portfolio data is ready.\n');
  console.log(`📧 Admin login: ${ADMIN_EMAIL}`);
  console.log(`🔑 Admin password: ${ADMIN_PASSWORD}`);
  console.log('⚠️  Change your password after first login via the admin panel.\n');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
