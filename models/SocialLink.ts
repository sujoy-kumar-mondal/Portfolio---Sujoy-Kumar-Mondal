import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISocialLink extends Document {
  platform: string;
  url: string;
  svgPath: string;
  hoverColor: string;
  order: number;
  isActive: boolean;
  position: 'top' | 'right' | 'both';
}

delete mongoose.models.SocialLink;

const SocialLinkSchema = new Schema<ISocialLink>({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  svgPath: { type: String, required: true },
  hoverColor: { type: String, default: '#ffffff' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  position: { type: String, enum: ['top', 'right', 'both'], default: 'right' },
}, { timestamps: true });

const SocialLink: Model<ISocialLink> =
  mongoose.models.SocialLink || mongoose.model<ISocialLink>('SocialLink', SocialLinkSchema);

export default SocialLink;
