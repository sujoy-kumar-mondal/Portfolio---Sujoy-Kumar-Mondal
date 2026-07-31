import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactInfo extends Document {
  address: string;
  addressMapUrl: string;
  mapEmbedUrl: string;
  phone: string;
  phoneUrl: string;
  email: string;
  emailUrl: string;
  contactFormRecipient: string;
  getInTouchTitle: string;
  letsMeetTitle: string;
}

const ContactInfoSchema = new Schema<IContactInfo>({
  address: { type: String, default: '' },
  addressMapUrl: { type: String, default: '' },
  mapEmbedUrl: { type: String, default: '' },
  phone: { type: String, default: '' },
  phoneUrl: { type: String, default: '' },
  email: { type: String, default: '' },
  emailUrl: { type: String, default: '' },
  contactFormRecipient: { type: String, default: '' },
  getInTouchTitle: { type: String, default: "" },
  letsMeetTitle: { type: String, default: "" },
}, { timestamps: true });

delete mongoose.models.ContactInfo;

const ContactInfo: Model<IContactInfo> =
  mongoose.models.ContactInfo || mongoose.model<IContactInfo>('ContactInfo', ContactInfoSchema);

export default ContactInfo;
