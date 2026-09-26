import mongoose, { Schema, Model } from 'mongoose';

export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG';
export type TransmissionType = 'Automatic' | 'Manual';
export type BodyType = 'SUV' | 'Sedan' | 'Hatchback' | 'Crossover' | 'Coupe';
export type VehicleStatus = 'Available' | 'Sold' | 'Reserved';

export interface IMedia360 {
  enabled: boolean;
  frames?: string[];
  frameCount?: number;
}

export interface IEngineSpecs {
  displacementCc?: number;
  powerHp?: number;
  torqueNm?: number;
}

export interface ICarItem {
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
  bodyType: BodyType;
  color: string;
  ownership: string;
  location: string;
  description: string;
  features: string[];
  images: string[];
  media360?: IMedia360;
  engineSpecs?: IEngineSpecs;
  featured: boolean;
  status: VehicleStatus;
  inspectionScore: number;
  registrationState?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICarDocument extends ICarItem {
  _id: string;
}

const CarSchema = new Schema<ICarItem>(
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
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
      required: true,
      index: true,
    },
    transmission: {
      type: String,
      enum: ['Automatic', 'Manual'],
      required: true,
      index: true,
    },
    kilometers: { type: Number, required: true, index: true },
    bodyType: {
      type: String,
      enum: ['SUV', 'Sedan', 'Hatchback', 'Crossover', 'Coupe'],
      required: true,
      index: true,
    },
    color: { type: String, required: true, trim: true },
    ownership: { type: String, required: true, default: '1st Owner' },
    location: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    features: { type: [String], default: [] },
    images: {
      type: [String],
      required: true,
      validate: [(val: string[]) => val.length > 0, 'Car must have at least one primary image.'],
    },
    media360: {
      enabled: { type: Boolean, default: false },
      frames: { type: [String], default: [] },
      frameCount: { type: Number, default: 0 },
    },
    engineSpecs: {
      displacementCc: { type: Number },
      powerHp: { type: Number },
      torqueNm: { type: Number },
    },
    featured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['Available', 'Sold', 'Reserved'],
      default: 'Available',
      index: true,
    },
    inspectionScore: { type: Number, default: 160, min: 0, max: 160 },
    registrationState: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search queries
CarSchema.index({
  title: 'text',
  brand: 'text',
  model: 'text',
  variant: 'text',
  description: 'text',
});

export const Car: Model<ICarItem> =
  mongoose.models.Car || mongoose.model<ICarItem>('Car', CarSchema);

export default Car;
