import connectToDatabase from './mongodb';
import Enquiry, { IEnquiryDocument, ICarSnapshot } from '@/models/Enquiry';
import { getCarByIdOrSlug } from './carsService';

export interface CreateEnquiryInput {
  customerName: string;
  phone: string;
  email: string;
  carId?: string | null;
  message?: string;
  acquisitionPreference?: string;
  source?: string;
}

// Global hot-reload safe store for development / offline resilience
declare global {
  // eslint-disable-next-line no-var
  var __enquiriesStore: IEnquiryDocument[] | undefined;
}

if (!global.__enquiriesStore) {
  global.__enquiriesStore = [];
}

/**
 * Validate customer email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate customer phone format (at least 10 digits)
 */
export function isValidPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Create a new customer enquiry in MongoDB with full validation
 */
export async function createEnquiry(input: CreateEnquiryInput): Promise<IEnquiryDocument> {
  const { customerName, phone, email, carId, message, acquisitionPreference, source } = input;

  // 1. Validate required fields
  if (!customerName || customerName.trim().length < 2) {
    throw new Error('Please enter a valid customer name (minimum 2 characters)');
  }
  if (!phone || !isValidPhone(phone)) {
    throw new Error('Please enter a valid 10-digit phone number');
  }
  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid email address');
  }

  // 2. Validate car association if provided
  let carSnapshot: ICarSnapshot | null = null;
  let resolvedCarId: string | null = null;

  if (carId && carId.trim()) {
    const car = await getCarByIdOrSlug(carId.trim());
    if (!car) {
      throw new Error('The selected vehicle could not be located in our inventory');
    }
    resolvedCarId = car._id;
    carSnapshot = {
      title: car.title,
      brand: car.brand,
      model: car.model,
      price: car.price,
      year: car.year,
      primaryImage: car.images && car.images.length > 0 ? car.images[0] : '/images/inventory/xuv700_hero.jpg',
    };
  }

  // 3. Spam / Duplicate submission prevention (within last 3 minutes)
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();

  let isConnected = false;
  try {
    await connectToDatabase();
    isConnected = true;
  } catch (err) {
    console.warn('[Aureus Motors] MongoDB connection check in enquiry service:', err);
    isConnected = false;
  }

  if (isConnected) {
    const recentDuplicate = await Enquiry.findOne({
      email: normalizedEmail,
      carId: resolvedCarId,
      createdAt: { $gte: new Date(Date.now() - 3 * 60 * 1000) },
    }).lean();

    if (recentDuplicate) {
      throw new Error(
        'An inquiry for this vehicle was already received from this email recently. Our concierge will be in touch shortly.'
      );
    }

    // Force secure initial status to 'New'
    const newEnquiry = await Enquiry.create({
      customerName: customerName.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      carId: resolvedCarId,
      carSnapshot,
      message: message ? message.trim() : '',
      acquisitionPreference: acquisitionPreference || 'Outright Purchase',
      status: 'New',
      source: source || 'car_detail',
    });

    const doc = newEnquiry.toObject() as unknown as Record<string, unknown>;
    const formatted: IEnquiryDocument = {
      ...(doc as unknown as IEnquiryDocument),
      _id: String(doc._id),
      createdAt: doc.createdAt ? new Date(doc.createdAt as string | Date) : new Date(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt as string | Date) : new Date(),
    };

    // Keep global cache in sync
    global.__enquiriesStore = [formatted, ...(global.__enquiriesStore || [])];
    return formatted;
  }

  // Resilient fallback store for offline development
  const now = new Date();
  const recentDuplicate = (global.__enquiriesStore || []).find(
    (e) =>
      e.email === normalizedEmail &&
      e.carId === resolvedCarId &&
      now.getTime() - new Date(e.createdAt || now).getTime() < 3 * 60 * 1000
  );

  if (recentDuplicate) {
    throw new Error(
      'An inquiry for this vehicle was already received from this email recently. Our concierge will be in touch shortly.'
    );
  }

  const fallbackDoc: IEnquiryDocument = {
    _id: `enquiry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    customerName: customerName.trim(),
    phone: normalizedPhone,
    email: normalizedEmail,
    carId: resolvedCarId,
    carSnapshot,
    message: message ? message.trim() : '',
    acquisitionPreference: acquisitionPreference || 'Outright Purchase',
    status: 'New',
    source: source || 'car_detail',
    createdAt: now,
    updatedAt: now,
  };

  global.__enquiriesStore = [fallbackDoc, ...(global.__enquiriesStore || [])];
  return fallbackDoc;
}

/**
 * Retrieve enquiries with optional status filter
 */
export async function getEnquiries(status?: string): Promise<IEnquiryDocument[]> {
  try {
    await connectToDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    const raw = await Enquiry.find(filter).sort({ createdAt: -1 }).lean();
    return (raw as unknown as Array<Record<string, unknown>>).map((d) => ({
      ...(d as unknown as IEnquiryDocument),
      _id: String(d._id),
      createdAt: d.createdAt ? new Date(d.createdAt as string | Date) : new Date(),
      updatedAt: d.updatedAt ? new Date(d.updatedAt as string | Date) : new Date(),
    }));
  } catch {
    let list = global.__enquiriesStore || [];
    if (status && status !== 'all') {
      list = list.filter((e) => e.status === status);
    }
    return list;
  }
}

/**
 * Update enquiry status in MongoDB (New, Contacted, Closed)
 */
export async function updateEnquiryStatus(
  id: string,
  status: 'New' | 'Contacted' | 'Closed'
): Promise<IEnquiryDocument | null> {
  await connectToDatabase();
  try {
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      const updated = await Enquiry.findByIdAndUpdate(
        id,
        { $set: { status, updatedAt: new Date() } },
        { new: true, lean: true }
      );
      if (updated) {
        return {
          ...(updated as unknown as IEnquiryDocument),
          _id: String((updated as unknown as { _id: unknown })._id),
        };
      }
    }
  } catch (err) {
    console.warn('[Aureus Motors] updateEnquiryStatus MongoDB error:', err);
  }

  // Update fallback store if present
  if (global.__enquiriesStore) {
    const item = global.__enquiriesStore.find((e) => e._id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date();
      return item;
    }
  }

  return null;
}

/**
 * Delete an enquiry document
 */
export async function deleteEnquiry(id: string): Promise<boolean> {
  await connectToDatabase();
  try {
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      const res = await Enquiry.findByIdAndDelete(id);
      if (res) return true;
    }
  } catch (err) {
    console.warn('[Aureus Motors] deleteEnquiry MongoDB error:', err);
  }

  if (global.__enquiriesStore) {
    const idx = global.__enquiriesStore.findIndex((e) => e._id === id);
    if (idx !== -1) {
      global.__enquiriesStore.splice(idx, 1);
      return true;
    }
  }

  return false;
}
