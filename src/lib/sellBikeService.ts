import connectToDatabase from './mongodb';
import SellBikeRequest, { ISellBikeItem, ISellBikeDocument, SellBikeStatus } from '@/models/SellBikeRequest';

export interface CreateSellBikeDto {
  ownerName: string;
  phone: string;
  email: string;
  location: string;
  brand?: string;
  bikeBrand?: string;
  model?: string;
  bikeModel?: string;
  variant?: string;
  year?: number | string;
  bikeYear?: number | string;
  kilometers: number | string;
  fuelType?: string;
  transmission?: string;
  bikeType?: string;
  engineCC?: number | string;
  expectedPrice?: number | string | null;
  message?: string;
}

export async function createSellBikeRequest(dto: CreateSellBikeDto): Promise<ISellBikeDocument> {
  await connectToDatabase();

  const ownerName = dto.ownerName?.trim();
  const phone = dto.phone?.trim();
  const email = dto.email?.trim().toLowerCase();
  const location = dto.location?.trim();
  const brand = (dto.brand || dto.bikeBrand)?.trim();
  const model = (dto.model || dto.bikeModel)?.trim();
  const variant = dto.variant?.trim() || '';
  const rawYear = Number(dto.year || dto.bikeYear);
  const kilometers = Number(dto.kilometers);
  const fuelType = dto.fuelType?.trim() || 'Petrol';
  const transmission = dto.transmission?.trim() || 'Manual';
  const bikeType = dto.bikeType?.trim() || 'Street / Naked';
  const engineCC = dto.engineCC ? Number(dto.engineCC) : undefined;
  const expectedPrice = dto.expectedPrice ? Number(dto.expectedPrice) : null;
  const message = dto.message?.trim() || '';

  if (!ownerName || ownerName.length < 2) {
    throw new Error('Please enter your full name (minimum 2 characters)');
  }

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  if (cleanPhone.length < 10) {
    throw new Error('Please provide a valid phone number (minimum 10 digits)');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please provide a valid email address');
  }

  if (!location) {
    throw new Error('Please specify your location or city');
  }

  if (!brand) {
    throw new Error('Please specify the motorcycle brand/make');
  }

  if (!model) {
    throw new Error('Please specify the motorcycle model');
  }

  const currentYear = new Date().getFullYear();
  if (isNaN(rawYear) || rawYear < 1995 || rawYear > currentYear + 1) {
    throw new Error(`Please provide a valid registration year between 1995 and ${currentYear + 1}`);
  }

  if (isNaN(kilometers) || kilometers < 0 || kilometers > 500000) {
    throw new Error('Please provide a valid odometer reading (between 0 and 500,000 km)');
  }

  // Duplicate / spam protection within 30 seconds
  const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
  const recentDuplicate = await SellBikeRequest.findOne({
    email,
    brand,
    model,
    createdAt: { $gte: thirtySecondsAgo },
  });
  if (recentDuplicate) {
    throw new Error('A valuation request for this motorcycle was recently received. Our acquisition team will contact you shortly.');
  }

  const request = await SellBikeRequest.create({
    ownerName,
    phone,
    email,
    location,
    brand,
    bikeBrand: brand,
    model,
    bikeModel: model,
    variant,
    year: rawYear,
    bikeYear: rawYear,
    kilometers,
    fuelType,
    transmission,
    bikeType,
    engineCC: engineCC || undefined,
    expectedPrice,
    message,
    status: 'New',
  });

  return JSON.parse(JSON.stringify(request));
}

export async function getSellBikeRequests(filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ requests: ISellBikeDocument[]; total: number; page: number; totalPages: number }> {
  await connectToDatabase();

  const query: Record<string, unknown> = {};

  if (filters.status && filters.status !== 'All') {
    query.status = filters.status;
  }

  if (filters.search && filters.search.trim()) {
    const s = filters.search.trim();
    query.$or = [
      { ownerName: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
      { location: { $regex: s, $options: 'i' } },
      { brand: { $regex: s, $options: 'i' } },
      { model: { $regex: s, $options: 'i' } },
      { bikeBrand: { $regex: s, $options: 'i' } },
      { bikeModel: { $regex: s, $options: 'i' } },
    ];
  }

  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 20));
  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    SellBikeRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    SellBikeRequest.countDocuments(query),
  ]);

  return {
    requests: JSON.parse(JSON.stringify(requests)),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function updateSellBikeStatus(
  id: string,
  status: SellBikeStatus
): Promise<ISellBikeDocument | null> {
  await connectToDatabase();
  const updated = await SellBikeRequest.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}
