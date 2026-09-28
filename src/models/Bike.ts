import mongoose, { Schema, Model } from 'mongoose';

export type FuelType = 'Petrol' | 'Electric';
export type TransmissionType = 'Manual' | 'Automatic' | 'CVT';
export type BikeType =
  | 'Commuter'
  | 'Cruiser'
  | 'Street / Naked'
  | 'Sports'
  | 'Tourer'
  | 'Scooter'
  | 'Adventure';
export type BikeStatus = 'Available' | 'Sold' | 'Archived' | 'Reserved';

export interface IBikeSpecs {
  engineCc?: number;
  mileageKmpl?: number;
  powerBhp?: number;
  torqueNm?: number;
  fuelTankCapacityLiters?: number;
  kerbWeightKg?: number;
  seatHeightMm?: number;
  brakingSystem?: string;
  coolingSystem?: string;
}

export interface IBikeItem {
  title: string;
  slug: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  kilometers: number;
  bikeType: BikeType;
  engineCC: number;
  mileage: number; // kmpl
  color: string;
  ownership: string;
  location: string;
  description: string;
  features: string[];
  images: string[];
  featured: boolean;
  status: BikeStatus;
  inspectionScore: number;
  registrationState?: string;
  specs?: IBikeSpecs;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBikeDocument extends IBikeItem {
  _id: string;
}

const BikeSchema = new Schema<IBikeItem>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true, index: true },
    variant: { type: String, required: true, trim: true },
    year: { type: Number, required: true, index: true },
    price: { type: Number, required: true, index: true },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Electric'],
      required: true,
      default: 'Petrol',
      index: true,
    },
    transmission: {
      type: String,
      enum: ['Manual', 'Automatic', 'CVT'],
      required: true,
      default: 'Manual',
      index: true,
    },
    kilometers: { type: Number, required: true, index: true },
    bikeType: {
      type: String,
      enum: ['Commuter', 'Cruiser', 'Street / Naked', 'Sports', 'Tourer', 'Scooter', 'Adventure'],
      required: true,
      default: 'Street / Naked',
      index: true,
    },
    engineCC: { type: Number, required: true, index: true },
    mileage: { type: Number, required: true }, // kmpl
    color: { type: String, required: true, trim: true },
    ownership: { type: String, required: true, default: '1st Owner' },
    location: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    features: { type: [String], default: [] },
    images: {
      type: [String],
      required: true,
      validate: [(val: string[]) => val.length > 0, 'Bike must have at least one primary image.'],
    },
    featured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['Available', 'Sold', 'Archived', 'Reserved'],
      default: 'Available',
      index: true,
    },
    inspectionScore: { type: Number, default: 120, min: 0, max: 120 },
    registrationState: { type: String, trim: true },
    specs: {
      engineCc: { type: Number },
      mileageKmpl: { type: Number },
      powerBhp: { type: Number },
      torqueNm: { type: Number },
      fuelTankCapacityLiters: { type: Number },
      kerbWeightKg: { type: Number },
      seatHeightMm: { type: Number },
      brakingSystem: { type: String },
      coolingSystem: { type: String },
    },
  },
  {
    timestamps: true,
    collection: 'bikes',
  }
);

// Compound text index for search queries
BikeSchema.index({
  title: 'text',
  brand: 'text',
  model: 'text',
  variant: 'text',
  description: 'text',
});

export const Bike: Model<IBikeItem> =
  mongoose.models.Bike || mongoose.model<IBikeItem>('Bike', BikeSchema);

export default Bike;
