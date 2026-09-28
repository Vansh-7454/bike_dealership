import connectToDatabase from './mongodb';
import SellRequest, { ISellRequestDocument, SellRequestStatus } from '@/models/SellRequest';

export interface CreateSellRequestInput {
  ownerName: string;
  phone: string;
  email: string;
  carBrand: string;
  carModel: string;
  carYear: number | string;
  kilometers: number | string;
  fuelType: string;
  transmission: string;
  expectedPrice?: number | string | null;
  location: string;
  message?: string;
}

// Global hot-reload safe store for fallback / offline development
declare global {
  // eslint-disable-next-line no-var
  var __sellRequestsStore: ISellRequestDocument[] | undefined;
}

if (!global.__sellRequestsStore) {
  global.__sellRequestsStore = [];
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Validate and create a new vehicle SellRequest in MongoDB
 */
export async function createSellRequest(input: CreateSellRequestInput): Promise<ISellRequestDocument> {
  const {
    ownerName,
    phone,
    email,
    carBrand,
    carModel,
    carYear,
    kilometers,
    fuelType,
    transmission,
    expectedPrice,
    location,
    message,
  } = input;

  // 1. Validate required contact details
  if (!ownerName || ownerName.trim().length < 2) {
    throw new Error('Please enter your full name (minimum 2 characters)');
  }
  if (!phone || !isValidPhone(phone)) {
    throw new Error('Please provide a valid 10-digit mobile number');
  }
  if (!email || !isValidEmail(email)) {
    throw new Error('Please provide a valid email address');
  }

  // 2. Validate vehicle details
  if (!carBrand || carBrand.trim().length === 0) {
    throw new Error('Vehicle manufacturer / brand is required');
  }
  if (!carModel || carModel.trim().length === 0) {
    throw new Error('Vehicle model and variant are required');
  }

  const parsedYear = typeof carYear === 'string' ? parseInt(carYear, 10) : carYear;
  const currentYear = new Date().getFullYear();
  if (isNaN(parsedYear) || parsedYear < 1990 || parsedYear > currentYear + 1) {
    throw new Error(`Please provide a valid registration year between 1990 and ${currentYear + 1}`);
  }

  const parsedKm = typeof kilometers === 'string' ? parseInt(kilometers, 10) : kilometers;
  if (isNaN(parsedKm) || parsedKm < 0) {
    throw new Error('Please provide a valid odometer reading in kilometers');
  }

  if (!location || location.trim().length === 0) {
    throw new Error('Registration state or city location is required');
  }

  const validFuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG'];
  const normalizedFuel = validFuelTypes.includes(fuelType) ? fuelType : 'Petrol';

  const validTransmissions = ['Automatic', 'Manual'];
  const normalizedTransmission = validTransmissions.includes(transmission) ? transmission : 'Automatic';

  let parsedPrice: number | null = null;
  if (expectedPrice !== undefined && expectedPrice !== null && expectedPrice !== '') {
    const num = typeof expectedPrice === 'string' ? parseFloat(expectedPrice) : expectedPrice;
    if (!isNaN(num) && num >= 0) {
      parsedPrice = num;
    }
  }

  // 3. Prevent duplicate spam submissions within 3 minutes
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();

  let isConnected = false;
  try {
    await connectToDatabase();
    isConnected = true;
  } catch (err) {
    console.warn('[Aureus Motors] MongoDB connection check in sellRequestService:', err);
    isConnected = false;
  }

  if (isConnected) {
    const recentDuplicate = await SellRequest.findOne({
      email: normalizedEmail,
      carBrand: { $regex: new RegExp(`^${carBrand.trim()}$`, 'i') },
      carModel: { $regex: new RegExp(`^${carModel.trim()}$`, 'i') },
      createdAt: { $gte: new Date(Date.now() - 3 * 60 * 1000) },
    }).lean();

    if (recentDuplicate) {
      throw new Error(
        'A sell request for this vehicle was already received recently. Our acquisition team will review your details and contact you.'
      );
    }

    const doc = await SellRequest.create({
      ownerName: ownerName.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      carBrand: carBrand.trim(),
      carModel: carModel.trim(),
      carYear: parsedYear,
      kilometers: parsedKm,
      fuelType: normalizedFuel,
      transmission: normalizedTransmission,
      expectedPrice: parsedPrice,
      location: location.trim(),
      message: message ? message.trim() : '',
      status: 'New',
    });

    const raw = doc.toObject() as unknown as Record<string, unknown>;
    const formatted: ISellRequestDocument = {
      ...(raw as unknown as ISellRequestDocument),
      _id: String(raw._id),
      createdAt: raw.createdAt ? new Date(raw.createdAt as string | Date) : new Date(),
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt as string | Date) : new Date(),
    };

    global.__sellRequestsStore = [formatted, ...(global.__sellRequestsStore || [])];
    return formatted;
  }

  // Fallback store
  const now = new Date();
  const recentDuplicate = (global.__sellRequestsStore || []).find(
    (r) =>
      r.email === normalizedEmail &&
      r.carBrand.toLowerCase() === carBrand.trim().toLowerCase() &&
      r.carModel.toLowerCase() === carModel.trim().toLowerCase() &&
      now.getTime() - new Date(r.createdAt || now).getTime() < 3 * 60 * 1000
  );

  if (recentDuplicate) {
    throw new Error(
      'A sell request for this vehicle was already received recently. Our acquisition team will review your details and contact you.'
    );
  }

  const fallbackDoc: ISellRequestDocument = {
    _id: `sellreq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ownerName: ownerName.trim(),
    phone: normalizedPhone,
    email: normalizedEmail,
    carBrand: carBrand.trim(),
    carModel: carModel.trim(),
    carYear: parsedYear,
    kilometers: parsedKm,
    fuelType: normalizedFuel,
    transmission: normalizedTransmission,
    expectedPrice: parsedPrice,
    location: location.trim(),
    message: message ? message.trim() : '',
    status: 'New',
    createdAt: now,
    updatedAt: now,
  };

  global.__sellRequestsStore = [fallbackDoc, ...(global.__sellRequestsStore || [])];
  return fallbackDoc;
}

/**
 * Retrieve sell requests with optional status and search filtering
 */
export async function getSellRequests(
  status?: string,
  search?: string
): Promise<ISellRequestDocument[]> {
  try {
    await connectToDatabase();
    const filter: Record<string, unknown> = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { ownerName: regex },
        { phone: regex },
        { email: regex },
        { carBrand: regex },
        { carModel: regex },
        { location: regex },
      ];
    }

    const raw = await SellRequest.find(filter).sort({ createdAt: -1 }).lean();
    return (raw as unknown as Array<Record<string, unknown>>).map((d) => ({
      ...(d as unknown as ISellRequestDocument),
      _id: String(d._id),
      createdAt: d.createdAt ? new Date(d.createdAt as string | Date) : new Date(),
      updatedAt: d.updatedAt ? new Date(d.updatedAt as string | Date) : new Date(),
    }));
  } catch {
    let list = global.__sellRequestsStore || [];
    if (status && status !== 'all') {
      list = list.filter((r) => r.status === status);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.ownerName.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.carBrand.toLowerCase().includes(q) ||
          r.carModel.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
      );
    }
    return list;
  }
}

/**
 * Retrieve single sell request by ID
 */
export async function getSellRequestById(id: string): Promise<ISellRequestDocument | null> {
  await connectToDatabase();
  try {
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      const found = await SellRequest.findById(id).lean();
      if (found) {
        return {
          ...(found as unknown as ISellRequestDocument),
          _id: String((found as unknown as { _id: unknown })._id),
        };
      }
    }
  } catch (err) {
    console.warn('[Aureus Motors] getSellRequestById error:', err);
  }

  const inMem = (global.__sellRequestsStore || []).find((r) => r._id === id);
  return inMem || null;
}

/**
 * Update status of a sell request (New, Contacted, Closed)
 */
export async function updateSellRequestStatus(
  id: string,
  status: SellRequestStatus
): Promise<ISellRequestDocument | null> {
  await connectToDatabase();
  try {
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      const updated = await SellRequest.findByIdAndUpdate(
        id,
        { $set: { status, updatedAt: new Date() } },
        { new: true, lean: true }
      );
      if (updated) {
        return {
          ...(updated as unknown as ISellRequestDocument),
          _id: String((updated as unknown as { _id: unknown })._id),
        };
      }
    }
  } catch (err) {
    console.warn('[Aureus Motors] updateSellRequestStatus error:', err);
  }

  if (global.__sellRequestsStore) {
    const item = global.__sellRequestsStore.find((r) => r._id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date();
      return item;
    }
  }

  return null;
}

/**
 * Delete a sell request
 */
export async function deleteSellRequest(id: string): Promise<boolean> {
  await connectToDatabase();
  try {
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      const res = await SellRequest.findByIdAndDelete(id);
      if (res) return true;
    }
  } catch (err) {
    console.warn('[Aureus Motors] deleteSellRequest error:', err);
  }

  if (global.__sellRequestsStore) {
    const idx = global.__sellRequestsStore.findIndex((r) => r._id === id);
    if (idx !== -1) {
      global.__sellRequestsStore.splice(idx, 1);
      return true;
    }
  }

  return false;
}
