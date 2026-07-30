# SKM Portfolio & Admin CMS 🚀

A modern, high-performance developer portfolio and feature-rich Content Management System (CMS) built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **MongoDB**, **NextAuth v5**, and **Cloudinary**.

---

## ✨ Features

### 🌟 Public Portfolio
- **Dynamic Aesthetic Design**: Sleek dark mode theme with glassmorphism UI, custom particle canvas background, and smooth micro-animations.
- **Interactive Project Showcase**:
  - Main project view with custom accent colors.
  - Optional project creation date / period display.
  - Multi-image gallery with modal image viewer.
- **Rich Profile & Skills**: Dynamic bio, automated tag filters, downloadable PDF CV, and custom SVG cursor support.
- **Social Links & Contact Info**: Customized social media icons with dynamic hover effects and Google Maps integration.

### 🔐 Admin Panel & Security
- **Single Active Session Control (Concurrent Login Protection)**: Real-time **Server-Sent Events (SSE)** architecture that instantly invalidates older active sessions on other devices when a new login occurs.
- **OTP Verification & Authentication**:
  - Secure credentials login with 6-digit email OTP verification powered by Nodemailer.
  - Email address change flow requiring OTP verification sent to the new email address.
  - Forgot password recovery via email OTP.
- **Project Management (CRUD)**:
  - Create, edit, reorder, and remove projects.
  - Batch multi-file drag-and-drop image uploader.
  - Automated Cloudinary asset cleanup on image deletion or form cancellation.
- **Profile & Content Management**: Update bio text, profile photo, CV file, custom cursor, skills, social links, and contact information directly from the dashboard.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/) (JWT strategy)
- **Media Storage**: [Cloudinary](https://cloudinary.com/) (unsigned & server-side deletion API)
- **Email Service**: [Nodemailer](https://nodemailer.com/) (Gmail SMTP for OTP delivery)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js 18+ installed on your system.

### 2. Environment Setup
Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Cloudinary Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer / Email OTP
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 3. Installation

```bash
npm install
```

### 4. Database Seeding

Initialize default admin credentials and default portfolio data:

```bash
npx tsx scripts/seed.ts
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
3. Add all environment variables listed in `.env.local` to the Vercel project settings.
4. Set the build command to `npm run build` and deploy.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
