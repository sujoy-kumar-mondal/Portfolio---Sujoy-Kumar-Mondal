import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
  name: string;
  intro: string;
  about: string;
  photoUrl: string;
  cvUrl: string;
  cursorUrl: string;
  skills: string[];
}

const ProfileSchema = new Schema<IProfile>({
  name: { type: String, default: 'Sujoy Kumar Mondal' },
  intro: { type: String, default: 'I am a Web Developer' },
  about: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  cvUrl: { type: String, default: '' },
  cursorUrl: { type: String, default: '' },
  skills: { type: [String], default: [] },
}, { timestamps: true });

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
