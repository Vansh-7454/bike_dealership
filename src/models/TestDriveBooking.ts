import mongoose, { Schema, Model } from 'mongoose';
import { ICarSnapshot } from './Enquiry';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export interface ITestDriveBookingItem {
  carId: mongoose.Types.ObjectId | string;
  carSnapshot?: ICarSnapshot | null;
  customerName: string;
  phone: string;
  email: string;
  preferredDate: Date;
  preferredTime: string;
  location?: string;
  message?: string;
  status: BookingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITestDriveBookingDocument extends ITestDriveBookingItem {
  _id: string;
}

const TestDriveBookingSchema = new Schema<ITestDriveBookingItem>(
  {
    carId: {
      type: Schema.Types.Mixed,
      ref: 'Car',
      required: [true, 'Vehicle reference is required for test-drive booking'],
      index: true,
    },
    carSnapshot: {
      title: { type: String, required: true },
      brand: { type: String },
      model: { type: String },
      price: { type: Number },
      year: { type: Number },
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
      required: [true, 'Preferred test-drive date is required'],
      validate: {
        validator: function (v: Date) {
          // Reject past dates (allow today and future)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return new Date(v) >= today;
        },
        message: 'Test-drive date must be today or in the future',
      },
    },
    preferredTime: {
      type: String,
      required: [true, 'Preferred time slot is required'],
      trim: true,
    },
    location: {
      type: String,
      default: 'Mumbai Flagship Studio (One BKC)',
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
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying bookings and preventing spam/duplicates
TestDriveBookingSchema.index({ email: 1, carId: 1, preferredDate: 1 });
TestDriveBookingSchema.index({ status: 1, createdAt: -1 });

export const TestDriveBooking: Model<ITestDriveBookingItem> =
  mongoose.models.TestDriveBooking ||
  mongoose.model<ITestDriveBookingItem>('TestDriveBooking', TestDriveBookingSchema);

export default TestDriveBooking;
