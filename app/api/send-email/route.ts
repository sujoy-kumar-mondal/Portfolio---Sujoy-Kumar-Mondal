import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactInfo from '@/models/ContactInfo';
import { sendContactEmail } from '@/lib/nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
    }

    await connectDB();
    const contactInfo = await ContactInfo.findOne().lean();
    const recipient = contactInfo?.contactFormRecipient || process.env.EMAIL_USER!;

    await sendContactEmail(name, email, phone || 'Not provided', message, recipient);

    return NextResponse.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
