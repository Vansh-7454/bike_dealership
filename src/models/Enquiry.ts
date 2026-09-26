import mongoose, { Schema, Model } from 'mongoose';

export type EnquiryStatus = 'New' | 'Contacted' | 'Closed';

export interface ICarSnapshot {
  title: string;
  brand: string;
  model: string;
  price: number;
  year: number;
  primaryImage: string;
}

export interface IEnquiryItem {
  customerName: string;
  phone: string;
  email: string;
  carId?: mongoose.Types.ObjectId | string | null;
  carSnapshot?: ICarSnapshot | null;
  message?: string;
  acquisitionPreference?: string;
  status: EnquiryStatus;
  source?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEnquiryDocument extends IEnquiryItem {
  _id: string;
}

const EnquirySchema = new Schema<IEnquiryItem>(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v: string) {
          // Indian / International phone regex: at least 10 digits
          return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(v.replace(/\s+/g, ''));
        },
        message: 'Please provide a valid phone number (minimum 10 digits)',
      },
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
    carId: {
      type: Schema.Types.Mixed,
      ref: 'Car',
      default: null,
      index: true,
    },
    carSnapshot: {
      title: { type: String },
      brand: { type: String },
      model: { type: String },
      price: { type: Number },
      year: { type: Number },
      primaryImage: { type: String },
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1500, 'Message cannot exceed 1500 characters'],
      default: '',
    },
    acquisitionPreference: {
      type: String,
      default: 'Outright Purchase',
      trim: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Closed'],
      default: 'New',
      index: true,
    },
    source: {
      type: String,
      default: 'car_detail',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying enquiries by status and creation date
EnquirySchema.index({ status: 1, createdAt: -1 });

export const Enquiry: Model<IEnquiryItem> =
  mongoose.models.Enquiry || mongoose.model<IEnquiryItem>('Enquiry', EnquirySchema);

export default Enquiry;
