import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactInfo extends Document {
  address: string;
  addressMapUrl: string;
  mapEmbedUrl: string;
  phone: string;
  email: string;
  contactFormRecipient: string;
  getInTouchTitle: string;
  letsMeetTitle: string;
}

const ContactInfoSchema = new Schema<IContactInfo>({
  address: { type: String, default: 'Vill: - Baruna, P.S: - Moyna, Dist: - Purba Medinipur, State: - WB, Pin: - 721642' },
  addressMapUrl: { type: String, default: 'https://maps.app.goo.gl/668Rvgm9yXq5BUtr9' },
  mapEmbedUrl: { type: String, default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8872.90935012639!2d87.77977312305684!3d22.169528014843788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02c12ecd73238b%3A0xdd9cd74185ed78a2!2sBaruna%20Manasamata%20Mandir!5e0!3m2!1sen!2sin!4v1737811517209!5m2!1sen!2sin' },
  phone: { type: String, default: '+91 9002842851' },
  email: { type: String, default: 'sujoy721642@gmail.com' },
  contactFormRecipient: { type: String, default: 'sujoy721642@gmail.com' },
  getInTouchTitle: { type: String, default: 'Get in Touch' },
  letsMeetTitle: { type: String, default: "Let's Meet" },
}, { timestamps: true });

const ContactInfo: Model<IContactInfo> =
  mongoose.models.ContactInfo || mongoose.model<IContactInfo>('ContactInfo', ContactInfoSchema);

export default ContactInfo;
