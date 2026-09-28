import mongoose, { Schema, Model } from 'mongoose';

export type SellBikeStatus = 'New' | 'Contacted' | 'Closed';

export interface ISellBikeItem {
  ownerName: string;
  phone: string;
  email: string;
  location: string;
  brand: string;
  bikeBrand?: string;
  model: string;
  bikeModel?: string;
  variant?: string;
  year: number;
  bikeYear?: number;
  kilometers: number;
  fuelType?: string;
  transmission?: string;
  bikeType?: string;
  engineCC?: number;
  expectedPrice?: number | null;
  message?: string;
  status: SellBikeStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISellBikeDocument extends ISellBikeItem {
  _id: string;
}

const SellBikeRequestSchema = new Schema<ISellBikeItem>(
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
    location: {
      type: String,
      required: [true, 'Location / City is required'],
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Motorcycle brand/make is required'],
      trim: true,
      maxlength: [50, 'Brand name cannot exceed 50 characters'],
    },
    model: {
      type: String,
      required: [true, 'Motorcycle model is required'],
      trim: true,
      maxlength: [100, 'Model name cannot exceed 100 characters'],
    },
    variant: {
      type: String,
      trim: true,
      maxlength: [100, 'Variant cannot exceed 100 characters'],
      default: '',
    },
    year: {
      type: Number,
      required: [true, 'Registration year is required'],
      min: [1995, 'Year must be 1995 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
    kilometers: {
      type: Number,
      required: [true, 'Odometer reading is required'],
      min: [0, 'Kilometers cannot be negative'],
      max: [500000, 'Kilometers exceed maximum allowable limit'],
    },
    fuelType: {
      type: String,
      trim: true,
      default: 'Petrol',
    },
    transmission: {
      type: String,
      trim: true,
      default: 'Manual',
    },
    bikeType: {
      type: String,
      trim: true,
      default: 'Naked / Roadster',
    },
    engineCC: {
      type: Number,
      default: null,
    },
    expectedPrice: {
      type: Number,
      default: null,
      min: [0, 'Expected price cannot be negative'],
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
    collection: 'sell_bike_requests',
  }
);

SellBikeRequestSchema.index({ status: 1, createdAt: -1 });
SellBikeRequestSchema.index({ email: 1, createdAt: -1 });

if (mongoose.models && mongoose.models.SellBikeRequest) {
  delete mongoose.models.SellBikeRequest;
}

export const SellBikeRequest: Model<ISellBikeItem> =
  mongoose.models.SellBikeRequest ||
  mongoose.model<ISellBikeItem>('SellBikeRequest', SellBikeRequestSchema);

export default SellBikeRequest;
