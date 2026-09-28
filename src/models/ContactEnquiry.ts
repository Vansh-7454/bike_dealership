import mongoose, { Schema, Model } from 'mongoose';

export type ContactEnquiryStatus = 'New' | 'Contacted' | 'Closed';

export interface IContactEnquiryItem {
  name: string;
  phone: string;
  email: string;
  topic: string;
  preferredDate?: string;
  message: string;
  status: ContactEnquiryStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IContactEnquiryDocument extends IContactEnquiryItem {
  _id: string;
}

const ContactEnquirySchema = new Schema<IContactEnquiryItem>(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    topic: {
      type: String,
      required: true,
      default: 'General Motorcycle Inquiry',
      trim: true,
    },
    preferredDate: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Closed'],
      default: 'New',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'contact_enquiries',
  }
);

ContactEnquirySchema.index({ status: 1, createdAt: -1 });

export const ContactEnquiry: Model<IContactEnquiryItem> =
  mongoose.models.ContactEnquiry ||
  mongoose.model<IContactEnquiryItem>('ContactEnquiry', ContactEnquirySchema);

export default ContactEnquiry;
