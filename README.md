# Modern Developer Portfolio & Admin CMS 🚀

A modern, high-performance developer portfolio and feature-rich Content Management System (CMS) built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **MongoDB**, **NextAuth v5**, and **Cloudinary**.

---

## ✨ Features

### 🌟 Public Portfolio
- **Dynamic Aesthetic Design**: Sleek dark mode theme with glassmorphism UI, custom interactive canvas background, and micro-animations.
- **Interactive Project Showcase**:
  - Main project views with custom accent color styling.
  - Optional project creation dates and tag filtering.
  - Multi-image gallery with modal image viewer.
- **Live Internet Clock**: Dynamic real-time date and time display (`DD-MM-YYYY hh:mm:ss AM/PM`) positioned in the top-right navbar with real-time internet synchronization and admin visibility toggle.
- **Dynamic Branding**: Custom navbar top-left logo and main hero banner logo loaded dynamically from database/Cloudinary.
- **Rich Profile & Skills**: Dynamic bio, skills list, downloadable PDF CV, and custom cursor support.
- **Social Links & Contact Info**: Customized social media icons with dynamic hover effects and interactive contact section.

### 🔐 Admin Panel & Security
- **Single Active Session Control (Concurrent Login Protection)**: Real-time **Server-Sent Events (SSE)** architecture that instantly invalidates older active sessions on other devices when a new login occurs.
- **OTP Verification & Authentication**:
  - Secure credentials login with 6-digit email OTP verification powered by Nodemailer.
  - Email address update flow requiring OTP verification sent to the new email address.
  - Forgot password recovery via email OTP.
- **Project Management (CRUD)**:
  - Create, edit, reorder, and remove projects.
  - Batch multi-file drag-and-drop image uploader.
  - Automated Cloudinary asset cleanup on image deletion or form cancellation.
- **Website Metadata & SEO Settings**:
  - Custom page title, meta description, keywords, and OpenGraph social card configuration.
  - Unified favicon uploader for primary icon, shortcut icon, and Apple touch icon.
  - Toggle live navbar date and time clock visibility on/off.
- **Profile & Content Management**: Update bio text, profile photo, CV file, custom cursor, skills, social links, and contact information directly from the dashboard.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/) (JWT strategy + SSE session control)
- **Media Storage**: [Cloudinary](https://cloudinary.com/) (unsigned upload & server-side deletion API)
- **Email Service**: [Nodemailer](https://nodemailer.com/) (Gmail SMTP for OTP delivery)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18+** installed on your system.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/portfolio-cms.git
cd portfolio-cms
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer / Email OTP Setup
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_min_32_chars
NEXTAUTH_URL=http://localhost:3000

# Admin Initial Setup (used by seed script)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
```

### 4. Database Seeding

Run the seed script to initialize default admin user credentials, website metadata, and profile in your MongoDB database:

```bash
npm run seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment

### Deploying to Vercel

1. Push your repository to **GitHub**.
2. Import your project into [Vercel](https://vercel.com).
3. Add all environment variables listed in `.env.local` to your Vercel project settings.
4. Set the build command to `npm run build` and deploy.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
