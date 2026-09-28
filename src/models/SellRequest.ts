import mongoose, { Schema, Model } from 'mongoose';

export type SellRequestStatus = 'New' | 'Contacted' | 'Closed';

export interface ISellRequestItem {
  ownerName: string;
  phone: string;
  email: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  kilometers: number;
  fuelType: string;
  transmission: string;
  expectedPrice?: number | null;
  location: string;
  message?: string;
  status: SellRequestStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISellRequestDocument extends ISellRequestItem {
  _id: string;
}

const SellRequestSchema = new Schema<ISellRequestItem>(
  {
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
      minlength: [2, 'Owner name must be at least 2 characters long'],
      maxlength: [100, 'Owner name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v: string) {
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
    carBrand: {
      type: String,
      required: [true, 'Vehicle brand/make is required'],
      trim: true,
      maxlength: [50, 'Brand name cannot exceed 50 characters'],
    },
    carModel: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
      maxlength: [100, 'Model name cannot exceed 100 characters'],
    },
    carYear: {
      type: Number,
      required: [true, 'Registration year is required'],
      min: [1990, 'Year must be 1990 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the distant future'],
    },
    kilometers: {
      type: Number,
      required: [true, 'Odometer reading is required'],
      min: [0, 'Kilometers cannot be negative'],
      max: [1000000, 'Kilometers exceed maximum allowable limit'],
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      trim: true,
      enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG'],
      default: 'Petrol',
    },
    transmission: {
      type: String,
      required: [true, 'Transmission type is required'],
      trim: true,
      enum: ['Automatic', 'Manual'],
      default: 'Automatic',
    },
    expectedPrice: {
      type: Number,
      default: null,
      min: [0, 'Expected price cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Location / RTO city is required'],
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1500, 'Message cannot exceed 1500 characters'],
      default: '',
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
  }
);

// Compound index for querying by status and submission date
SellRequestSchema.index({ status: 1, createdAt: -1 });

export const SellRequest: Model<ISellRequestItem> =
  mongoose.models.SellRequest || mongoose.model<ISellRequestItem>('SellRequest', SellRequestSchema);

export default SellRequest;
