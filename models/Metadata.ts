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
  createdAt?: Date;
  updatedAt?: Date;
}

const MetadataSchema = new Schema<IMetadata>(
  {
    _id: { type: String, default: 'site_metadata' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: [{ type: String }],
    icons: {
      icon: { type: String, required: true },
      shortcut: { type: String, required: true },
      apple: { type: String, required: true },
    },
    openGraph: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      type: { type: String, default: 'website' },
    },
  },
  { 
    timestamps: true,
    _id: false 
  }
);

const MetadataModel: Model<IMetadata> =
  mongoose.models.Metadata || mongoose.model<IMetadata>('Metadata', MetadataSchema, 'metadata');

export default MetadataModel;