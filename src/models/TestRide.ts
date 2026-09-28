import mongoose, { Schema, Model } from 'mongoose';
import { IBikeSnapshot } from './Enquiry';

export type TestRideStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface ITestRideItem {
  bikeId: mongoose.Types.ObjectId | string;
  bikeSnapshot?: IBikeSnapshot | null;
  customerName: string;
  phone: string;
  email: string;
  preferredDate: Date;
  preferredTime: string;
  drivingLicenseVerified: boolean;
  location?: string;
  message?: string;
  status: TestRideStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITestRideDocument extends ITestRideItem {
  _id: string;
}

const TestRideSchema = new Schema<ITestRideItem>(
  {
    bikeId: {
      type: Schema.Types.Mixed,
      ref: 'Bike',
      required: [true, 'Bike reference is required for test-ride booking'],
      index: true,
    },
    bikeSnapshot: {
      title: { type: String, required: true },
      brand: { type: String },
      model: { type: String },
      price: { type: Number },
      year: { type: Number },
      engineCC: { type: Number },
      primaryImage: { type: String },
    },
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
    preferredDate: {
      type: Date,
      required: [true, 'Preferred test-ride date is required'],
      validate: {
        validator: function (v: Date) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return new Date(v) >= today;
        },
        message: 'Test-ride date must be today or in the future',
      },
    },
    preferredTime: {
      type: String,
      required: [true, 'Preferred time slot is required'],
      trim: true,
    },
    drivingLicenseVerified: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      default: 'Torque Flagship Studio (Indiranagar, Bengaluru)',
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'test_rides',
  }
);

TestRideSchema.index({ email: 1, bikeId: 1, preferredDate: 1 });
TestRideSchema.index({ status: 1, createdAt: -1 });

export const TestRide: Model<ITestRideItem> =
  mongoose.models.TestRide || mongoose.model<ITestRideItem>('TestRide', TestRideSchema);

export default TestRide;
