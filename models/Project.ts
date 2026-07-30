import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDescriptionPart {
  text: string;
  url?: string;
}

export interface IProject extends Document {
  name: string;
  slug: string;
  category: string;
  date?: string;
  shortDescription: IDescriptionPart[];
  description: IDescriptionPart[];
  mainImage: string;
  images: string[];
  projectUrl: string;
  tags: string[];
  features: string[];
  workingPrinciple: string;
  accentColor: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DescriptionPartSchema = new Schema<IDescriptionPart>({
  text: { type: String, required: true },
  url: { type: String, default: '' },
}, { _id: false });

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, default: '' },
  date: { type: String, default: '' },
  shortDescription: { type: [DescriptionPartSchema], default: [] },
  description: { type: [DescriptionPartSchema], default: [] },
  mainImage: { type: String, default: '' },
  images: { type: [String], default: [] },
  projectUrl: { type: String, default: '' },
  tags: { type: [String], default: [] },
  features: { type: [String], default: [] },
  workingPrinciple: { type: String, default: '' },
  accentColor: { type: String, default: '#5292ff' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Prevent stale cached model in Next.js development HMR
if (mongoose.models && mongoose.models.Project) {
  delete mongoose.models.Project;
}

const Project: Model<IProject> = mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
