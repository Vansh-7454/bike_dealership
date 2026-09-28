import mongoose from 'mongoose';
import connectToDatabase from './mongodb';
import Enquiry, { IEnquiryItem, IEnquiryDocument, EnquiryStatus } from '@/models/Enquiry';
import Bike from '@/models/Bike';
import { getBikeByIdOrSlug } from './bikesService';

export interface CreateEnquiryDto {
  customerName: string;
  phone: string;
  email: string;
  bikeId?: string | null;
  message?: string;
  acquisitionPreference?: string;
  source?: string;
}

let inMemoryEnquiries: IEnquiryDocument[] = [];

export async function createEnquiry(dto: CreateEnquiryDto): Promise<IEnquiryDocument> {
  const customerName = dto.customerName?.trim();
  const phone = dto.phone?.trim();
  const email = dto.email?.trim().toLowerCase();
  const message = dto.message?.trim() || '';

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

  if (message.length > 1500) {
    throw new Error('Message cannot exceed 1500 characters');
  }

  let bikeRecord: any = null;
  let bikeSnapshot = null;

  if (dto.bikeId) {
    try {
      await connectToDatabase();
      if (mongoose.Types.ObjectId.isValid(dto.bikeId)) {
        bikeRecord = await Bike.findById(dto.bikeId).lean();
      }
      if (!bikeRecord) {
        bikeRecord = await Bike.findOne({ slug: String(dto.bikeId).trim() }).lean();
      }
    } catch {
      // Continue to fallback
    }

    if (!bikeRecord) {
      bikeRecord = await getBikeByIdOrSlug(dto.bikeId);
    }

    if (bikeRecord) {
      bikeSnapshot = {
        title: bikeRecord.title,
        brand: bikeRecord.brand,
        model: bikeRecord.model,
        price: bikeRecord.price,
        year: bikeRecord.year,
        engineCC: bikeRecord.engineCC,
        primaryImage: bikeRecord.images?.[0] || '/images/bikes/hunter_350_hero.jpg',
      };
    }
  }

  try {
    await connectToDatabase();
    // Duplicate / spam protection within 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentDuplicate = await Enquiry.findOne({
      email,
      ...(bikeRecord ? { bikeId: bikeRecord._id } : {}),
      createdAt: { $gte: thirtySecondsAgo },
    });
    if (recentDuplicate) {
      throw new Error('An enquiry was recently submitted with this contact information. Our team will contact you shortly.');
    }

    const enquiry = await Enquiry.create({
      customerName,
      phone,
      email,
      bikeId: bikeRecord ? bikeRecord._id : null,
      bikeSnapshot,
      message,
      acquisitionPreference: dto.acquisitionPreference || 'Outright Purchase',
      status: 'New',
      source: dto.source || 'bike_detail',
    });

    return JSON.parse(JSON.stringify(enquiry));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : '';
    if (errMsg.includes('recently submitted')) {
      throw err;
    }
    console.warn('[Torque Two-Wheelers] DB unavailable for enquiry, storing in memory:', errMsg);
    const memoryRecord = {
      _id: `enq-${Date.now()}` as unknown as mongoose.Types.ObjectId,
      customerName,
      phone,
      email,
      bikeId: bikeRecord ? bikeRecord._id : null,
      bikeSnapshot,
      message,
      acquisitionPreference: dto.acquisitionPreference || 'Outright Purchase',
      status: 'New',
      source: dto.source || 'bike_detail',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as IEnquiryDocument;
    inMemoryEnquiries.unshift(memoryRecord);
    return memoryRecord;
  }
}

export async function getEnquiries(filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ enquiries: IEnquiryDocument[]; total: number; page: number; totalPages: number }> {
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

    const [enquiries, total] = await Promise.all([
      Enquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Enquiry.countDocuments(query),
    ]);

    return {
      enquiries: JSON.parse(JSON.stringify(enquiries)),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err) {
    console.warn('[Torque Two-Wheelers] DB unavailable for getEnquiries, serving memory:', (err as Error).message);
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 20));
    const total = inMemoryEnquiries.length;
    return {
      enquiries: inMemoryEnquiries.slice((page - 1) * limit, page * limit),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<IEnquiryDocument | null> {
  try {
    await connectToDatabase();
    const updated = await Enquiry.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
    if (updated) return JSON.parse(JSON.stringify(updated));
  } catch {
    // Continue to memory
  }

  const match = inMemoryEnquiries.find((e) => String(e._id) === id);
  if (match) {
    match.status = status;
    return match;
  }
  return null;
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const res = await Enquiry.findByIdAndDelete(id);
    if (res) return true;
  } catch {
    // Continue
  }

  const prevLen = inMemoryEnquiries.length;
  inMemoryEnquiries = inMemoryEnquiries.filter((e) => String(e._id) !== id);
  return inMemoryEnquiries.length < prevLen;
}
