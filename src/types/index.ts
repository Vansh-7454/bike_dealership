/**
 * Core Domain Types for Aureus Motors Pre-Owned Platform
 * Designed for future MongoDB / Mongoose schema integration (Phase 2+)
 */

export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
export type TransmissionType = 'Automatic' | 'Manual' | 'Dual-Clutch' | 'Direct Drive';
export type BodyType = 'SUV' | 'Sedan' | 'Crossover' | 'Coupe' | 'Hatchback';
export type CarStatus = 'available' | 'reserved' | 'sold';
export type UserRole = 'admin' | 'staff' | 'client';
export type EnquiryStatus = 'new' | 'contacted' | 'resolved' | 'closed';
export type BookingStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled';

export interface ICarSpecification {
  powerHp: number;
  torqueNm: number;
  acceleration0to100: string;
  topSpeedKmH?: number;
  rangeKm?: number;
  batteryCapacityKwh?: number;
  seatingCapacity: number;
  bootSpaceLiters: number;
}

export interface ICarInspectionItem {
  category: 'Mechanical' | 'Electrical' | 'Body & Paint' | 'Interior & Glass' | 'Tires & Brakes' | 'Documentation';
  status: 'passed' | 'reconditioned';
  notes?: string;
}

export interface ICar {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  variant: string;
  price: number;
  originalMsrp?: number;
  mileageKm: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  bodyType: BodyType;
  ownersCount: number;
  registrationState: string;
  registrationYear: number;
  exteriorColor: string;
  interiorColor: string;
  locationCity: string;
  status: CarStatus;
  isHeroShowcase?: boolean;
  featuredImages: {
    hero: string;
    front: string;
    interior: string;
    rear?: string;
    side?: string;
  };
  gallery: string[];
  keyHighlights: string[];
  specs: ICarSpecification;
  inspectionSummary: {
    totalPointsInspected: number;
    passedPoints: number;
    inspectionDate: string;
    certificationBadge: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface IEnquiry {
  id: string;
  carId: string;
  carTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  message: string;
  preferredContactMethod: 'phone' | 'whatsapp' | 'email';
  status: EnquiryStatus;
  createdAt: string;
}

export interface ITestDriveBooking {
  id: string;
  carId: string;
  carTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredDate: string;
  preferredTimeSlot: 'morning' | 'afternoon' | 'evening';
  showroomLocation: string;
  drivingLicenseVerified: boolean;
  specialRequests?: string;
  status: BookingStatus;
  createdAt: string;
}
