import mongoose, { Schema, Document, Model } from 'mongoose';

// Omit default _id from Mongoose Document and redefine as string
export interface IMetadata extends Omit<Document, '_id'> {
  _id: string;
  title: string;
  description: string;
  keywords: string[];
  icons: {
    icon: string;
    shortcut: string;
    apple: string;
  };
  openGraph: {
    title: string;
    description: string;
    type: string;
  };
  logos?: {
    navbarLogo?: string;
    bannerLogo?: string;
  };
  cursorUrl?: string;
  showDateTime?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const MetadataSchema = new Schema<IMetadata>(
  {
    _id: { type: String, default: 'site_metadata' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }],
    icons: {
      icon: { type: String, default: '' },
      shortcut: { type: String, default: '' },
      apple: { type: String, default: '' },
    },
    openGraph: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      type: { type: String, default: 'website' },
    },
    logos: {
      navbarLogo: { type: String, default: '' },
      bannerLogo: { type: String, default: '' },
    },
    cursorUrl: { type: String, default: '' },
    showDateTime: { type: Boolean, default: true },
  },
  { 
    timestamps: true,
    _id: false 
  }
);

// Clear cached model to ensure schema updates (e.g. logos) are recompiled properly in dev mode
if (mongoose.models && mongoose.models.Metadata) {
  delete mongoose.models.Metadata;
}

const MetadataModel: Model<IMetadata> =
  mongoose.models.Metadata || mongoose.model<IMetadata>('Metadata', MetadataSchema, 'metadata');

export default MetadataModel;