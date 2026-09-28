import mongoose, { Schema, Model } from 'mongoose';

export interface IAdminItem {
  email: string;
  password: string; // bcrypt hash
  name: string;
  role: 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdminDocument extends IAdminItem {
  _id: string;
}

const AdminSchema = new Schema<IAdminItem>(
  {
    email: {
      type: String,
      required: [true, 'Admin email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Admin password hash is required'],
    },
    name: {
      type: String,
      required: true,
      default: 'Aureus Motors Admin',
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Admin: Model<IAdminItem> =
  mongoose.models.Admin || mongoose.model<IAdminItem>('Admin', AdminSchema);

export default Admin;
