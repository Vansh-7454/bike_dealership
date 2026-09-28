/**
 * Core Domain Types for Torque Two-Wheelers Pre-Owned Motorcycle Platform
 * Completely independent bike dealership architecture
 */

export type FuelType = 'Petrol' | 'Electric';
export type TransmissionType = 'Manual' | 'Automatic' | 'CVT';
export type BikeType =
  | 'Commuter'
  | 'Cruiser'
  | 'Street / Naked'
  | 'Naked / Roadster'
  | 'Sports'
  | 'Sport'
  | 'Tourer'
  | 'Scooter'
  | 'Adventure';

export type BikeStatus = 'Available' | 'Sold' | 'Archived' | 'Reserved';
export type UserRole = 'admin' | 'staff' | 'rider';
export type EnquiryStatus = 'New' | 'Contacted' | 'Closed';
export type TestRideStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type SellBikeStatus =
  | 'Pending'
  | 'Under Inspection'
  | 'Offer Made'
  | 'Purchased'
  | 'Rejected'
  | 'New'
  | 'Contacted'
  | 'Closed';

export interface IBikeSpecification {
  engineCc?: number;
  engineCC?: number;
  mileageKmpl?: number;
  mileage?: number;
  powerBhp?: number;
  torqueNm?: number;
  fuelTankCapacityLiters?: number;
  kerbWeightKg?: number;
  seatHeightMm?: number;
  brakingSystem?: string; // e.g. "Dual Channel ABS"
  coolingSystem?: string; // e.g. "Air-Oil Cooled"
}

export interface IBikeInspectionCategory {
  title: string;
  status: string;
  pointsChecked: number;
}

export interface IBike {
  _id?: string;
  id?: string;
  slug?: string;
  title: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  originalMsrp?: number;
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
  inspectionScore?: number; // out of 120 points
  registrationState?: string;
  specifications?: IBikeSpecification;
  specs?: IBikeSpecification;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: string | Date;
}

export interface IEnquiry {
  _id?: string;
  id?: string;
  bikeId?: string | null;
  bikeTitle?: string;
  bikeSnapshot?: {
    title: string;
    brand: string;
    model: string;
    price: number;
    year: number;
    engineCC?: number;
    primaryImage?: string;
  } | null;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  email?: string;
  phone?: string;
  city?: string;
  message?: string;
  acquisitionPreference?: string;
  preferredContactMethod?: 'phone' | 'whatsapp' | 'email';
  status: EnquiryStatus;
  createdAt?: string | Date;
}

export interface ITestRideBooking {
  _id?: string;
  id?: string;
  bikeId: string;
  bikeTitle: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  email?: string;
  phone?: string;
  preferredDate: string;
  preferredTime?: string;
  preferredTimeSlot?: string;
  drivingLicenseVerified?: boolean;
  drivingLicenseNumber?: string;
  helmetRequired?: boolean;
  ridingExperience?: string;
  showroomLocation?: string;
  specialRequests?: string;
  message?: string;
  status: TestRideStatus;
  createdAt?: string | Date;
}

export interface ISellBikeRequest {
  _id?: string;
  id?: string;
  ownerName: string;
  phone: string;
  email: string;
  city?: string;
  bikeBrand?: string;
  bikeModel?: string;
  bikeYear?: number;
  bikeTitle?: string;
  brand?: string;
  model?: string;
  variant?: string;
  registrationYear?: number;
  registrationNumber?: string;
  ownership?: string;
  condition?: string;
  kilometers?: number;
  bikeType?: string;
  engineCC?: number;
  expectedPrice?: number | null;
  location?: string;
  message?: string;
  status: SellBikeStatus;
  createdAt?: string | Date;
}

export interface IContactEnquiry {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  email: string;
  topic: string;
  preferredDate?: string;
  message: string;
  status?: EnquiryStatus;
  createdAt?: string | Date;
}
