import mongoose from 'mongoose';
import connectToDatabase from './mongodb';
import TestRide, { ITestRideItem, ITestRideDocument, TestRideStatus } from '@/models/TestRide';
import Bike, { IBikeDocument } from '@/models/Bike';
import { getBikeByIdOrSlug } from './bikesService';

export interface CreateTestRideDto {
  bikeId: string;
  customerName: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  drivingLicenseVerified?: boolean;
  location?: string;
  message?: string;
}

let inMemoryTestRides: ITestRideDocument[] = [];

export async function createTestRideBooking(dto: CreateTestRideDto): Promise<ITestRideDocument> {
  const customerName = dto.customerName?.trim();
  const phone = dto.phone?.trim();
  const email = dto.email?.trim().toLowerCase();
  const preferredTime = dto.preferredTime?.trim();

  if (!customerName || customerName.length < 2) {
    throw new Error('Please enter your full name (minimum 2 characters)');
  }

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  if (cleanPhone.length < 10) {
    throw new Error('Please provide a valid phone number (minimum 10 digits)');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please provide a valid email address');
  }

  if (!dto.preferredDate) {
    throw new Error('Please select a preferred test ride date');
  }

  const testDate = new Date(dto.preferredDate);
  if (isNaN(testDate.getTime())) {
    throw new Error('Invalid test ride date specified');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (testDate < today) {
    throw new Error('Preferred test ride date must be today or in the future');
  }

  if (!preferredTime) {
    throw new Error('Please select a preferred time slot');
  }

  // Look up bike from DB or in-memory service
  let bike: any = null;
  try {
    await connectToDatabase();
    if (mongoose.Types.ObjectId.isValid(dto.bikeId)) {
      bike = await Bike.findById(dto.bikeId).lean();
    }
    if (!bike) {
      bike = await Bike.findOne({ slug: dto.bikeId.trim() }).lean();
    }
  } catch {
    // If DB is offline, fall back to bikesService
  }

  if (!bike) {
    bike = await getBikeByIdOrSlug(dto.bikeId);
  }

  if (!bike) {
    throw new Error('Motorcycle not found. Please select a valid motorcycle from our inventory.');
  }

  if (bike.status === 'Sold') {
    throw new Error('This motorcycle has been sold and is no longer available for test rides.');
  }

  const bikeSnapshot = {
    title: bike.title,
    brand: bike.brand,
    model: bike.model,
    price: bike.price,
    year: bike.year,
    engineCC: bike.engineCC,
    primaryImage: bike.images?.[0] || '/images/bikes/hunter_350_hero.jpg',
  };

  try {
    await connectToDatabase();
    // Duplicate / spam protection: check if an identical request was made in the past 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentDuplicate = await TestRide.findOne({
      email,
      bikeId: bike._id,
      createdAt: { $gte: thirtySecondsAgo },
    });
    if (recentDuplicate) {
      throw new Error('A test ride request for this motorcycle was recently received. Our concierge will be in touch shortly.');
    }

    const booking = await TestRide.create({
      bikeId: bike._id,
      bikeSnapshot,
      customerName,
      phone,
      email,
      preferredDate: testDate,
      preferredTime,
      drivingLicenseVerified: dto.drivingLicenseVerified ?? true,
      location: dto.location?.trim() || 'Torque Flagship Studio (Indiranagar, Bengaluru)',
      message: dto.message?.trim() || '',
      status: 'Pending',
    });

    return JSON.parse(JSON.stringify(booking));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : '';
    if (errMsg.includes('recently received')) {
      throw err;
    }
    console.warn('[Torque Two-Wheelers] DB unavailable for test ride, storing in memory:', errMsg);
    const memoryBooking = {
      _id: `tr-${Date.now()}` as unknown as mongoose.Types.ObjectId,
      bikeId: bike._id,
      bikeSnapshot,
      customerName,
      phone,
      email,
      preferredDate: testDate,
      preferredTime,
      drivingLicenseVerified: dto.drivingLicenseVerified ?? true,
      location: dto.location?.trim() || 'Torque Flagship Studio (Indiranagar, Bengaluru)',
      message: dto.message?.trim() || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as ITestRideDocument;
    inMemoryTestRides.unshift(memoryBooking);
    return memoryBooking;
  }
}

export async function getTestRideBookings(filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ bookings: ITestRideDocument[]; total: number; page: number; totalPages: number }> {
  try {
    await connectToDatabase();

    const query: Record<string, unknown> = {};

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    if (filters.search && filters.search.trim()) {
      const s = filters.search.trim();
      query.$or = [
        { customerName: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { 'bikeSnapshot.title': { $regex: s, $options: 'i' } },
      ];
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      TestRide.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      TestRide.countDocuments(query),
    ]);

    return {
      bookings: JSON.parse(JSON.stringify(bookings)),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err) {
    console.warn('[Torque Two-Wheelers] DB unavailable for getTestRideBookings, serving in-memory:', (err as Error).message);
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 20));
    const total = inMemoryTestRides.length;
    return {
      bookings: inMemoryTestRides.slice((page - 1) * limit, page * limit),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export async function updateTestRideStatus(
  id: string,
  status: TestRideStatus
): Promise<ITestRideDocument | null> {
  try {
    await connectToDatabase();
    const updated = await TestRide.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
    if (updated) return JSON.parse(JSON.stringify(updated));
  } catch {
    // Continue to memory
  }

  const match = inMemoryTestRides.find((t) => String(t._id) === id);
  if (match) {
    match.status = status;
    return match;
  }
  return null;
}
