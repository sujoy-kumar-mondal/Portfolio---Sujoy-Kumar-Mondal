import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
  name: string;
  intro: string;
  about: string;
  photoUrl: string;
  cvUrl: string;
  skills: string[];
}

const ProfileSchema = new Schema<IProfile>({
  name: { type: String, default: '' },
  intro: { type: String, default: '' },
  about: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  cvUrl: { type: String, default: '' },
  skills: { type: [String], default: [] },
}, { timestamps: true });

// Reset cached Mongoose model to ensure updated schema in dev mode
if (mongoose.models && mongoose.models.Profile) {
  delete mongoose.models.Profile;
}

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
