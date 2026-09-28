import mongoose from 'mongoose';
import connectToDatabase from './mongodb';
import Enquiry, { IEnquiryItem, IEnquiryDocument, EnquiryStatus } from '@/models/Enquiry';
import Bike from '@/models/Bike';

export interface CreateEnquiryDto {
  customerName: string;
  phone: string;
  email: string;
  bikeId?: string | null;
  message?: string;
  acquisitionPreference?: string;
  source?: string;
}

export async function createEnquiry(dto: CreateEnquiryDto): Promise<IEnquiryDocument> {
  await connectToDatabase();

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
    if (mongoose.Types.ObjectId.isValid(dto.bikeId)) {
      bikeRecord = await Bike.findById(dto.bikeId).lean();
    }
    if (!bikeRecord) {
      bikeRecord = await Bike.findOne({ slug: String(dto.bikeId).trim() }).lean();
    }

    if (!bikeRecord) {
      throw new Error('Associated motorcycle not found in inventory.');
    }

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
}

export async function getEnquiries(filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ enquiries: IEnquiryDocument[]; total: number; page: number; totalPages: number }> {
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
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<IEnquiryDocument | null> {
  await connectToDatabase();
  const updated = await Enquiry.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  await connectToDatabase();
  const res = await Enquiry.findByIdAndDelete(id);
  return Boolean(res);
}

