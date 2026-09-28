import mongoose from 'mongoose';
import connectToDatabase from './mongodb';
import ContactEnquiry, { IContactEnquiryItem, IContactEnquiryDocument, ContactEnquiryStatus } from '@/models/ContactEnquiry';

export interface CreateContactDto {
  name: string;
  phone: string;
  email: string;
  topic?: string;
  preferredDate?: string;
  message: string;
}

let inMemoryContactEnquiries: IContactEnquiryDocument[] = [];

export async function createContactEnquiry(dto: CreateContactDto): Promise<IContactEnquiryDocument> {
  const name = dto.name?.trim();
  const phone = dto.phone?.trim();
  const email = dto.email?.trim().toLowerCase();
  const message = dto.message?.trim();

  if (!name || name.length < 2) {
    throw new Error('Please enter your full name (minimum 2 characters)');
  }

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  if (cleanPhone.length < 10) {
    throw new Error('Please provide a valid phone number (minimum 10 digits)');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please provide a valid email address');
  }

  if (!message) {
    throw new Error('Please provide a message or inquiry details');
  }

  if (message.length > 2000) {
    throw new Error('Message cannot exceed 2000 characters');
  }

  try {
    await connectToDatabase();
    // Duplicate / spam protection within 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentDuplicate = await ContactEnquiry.findOne({
      email,
      message,
      createdAt: { $gte: thirtySecondsAgo },
    });
    if (recentDuplicate) {
      throw new Error('An inquiry with these details was recently received. Our studio will contact you shortly.');
    }

    const record = await ContactEnquiry.create({
      name,
      phone,
      email,
      topic: dto.topic || 'General Motorcycle Inquiry',
      preferredDate: dto.preferredDate?.trim() || undefined,
      message,
      status: 'New',
    });

    return JSON.parse(JSON.stringify(record));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : '';
    if (errMsg.includes('recently received')) {
      throw err;
    }
    console.warn('[Torque Two-Wheelers] DB unavailable for contact inquiry, storing in memory:', errMsg);
    const memoryRecord = {
      _id: `contact-${Date.now()}` as unknown as mongoose.Types.ObjectId,
      name,
      phone,
      email,
      topic: dto.topic || 'General Motorcycle Inquiry',
      preferredDate: dto.preferredDate?.trim() || undefined,
      message,
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as IContactEnquiryDocument;
    inMemoryContactEnquiries.unshift(memoryRecord);
    return memoryRecord;
  }
}

export async function getContactEnquiries(filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ enquiries: IContactEnquiryDocument[]; total: number; page: number; totalPages: number }> {
  try {
    await connectToDatabase();

    const query: Record<string, unknown> = {};

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    if (filters.search && filters.search.trim()) {
      const s = filters.search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { message: { $regex: s, $options: 'i' } },
        { topic: { $regex: s, $options: 'i' } },
      ];
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const [enquiries, total] = await Promise.all([
      ContactEnquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ContactEnquiry.countDocuments(query),
    ]);

    return {
      enquiries: JSON.parse(JSON.stringify(enquiries)),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err) {
    console.warn('[Torque Two-Wheelers] DB unavailable for getContactEnquiries, serving memory:', (err as Error).message);
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 20));
    const total = inMemoryContactEnquiries.length;
    return {
      enquiries: inMemoryContactEnquiries.slice((page - 1) * limit, page * limit),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export async function updateContactEnquiryStatus(
  id: string,
  status: ContactEnquiryStatus
): Promise<IContactEnquiryDocument | null> {
  try {
    await connectToDatabase();
    const updated = await ContactEnquiry.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
    if (updated) return JSON.parse(JSON.stringify(updated));
  } catch {
    // Continue to memory
  }

  const match = inMemoryContactEnquiries.find((c) => String(c._id) === id);
  if (match) {
    match.status = status;
    return match;
  }
  return null;
}

export async function deleteContactEnquiry(id: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const result = await ContactEnquiry.findByIdAndDelete(id);
    if (result) return true;
  } catch {
    // Continue
  }

  const prevLen = inMemoryContactEnquiries.length;
  inMemoryContactEnquiries = inMemoryContactEnquiries.filter((c) => String(c._id) !== id);
  return inMemoryContactEnquiries.length < prevLen;
}
