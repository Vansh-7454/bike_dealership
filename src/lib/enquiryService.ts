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

    const doc: any = newEnquiry.toObject();
    const formatted: IEnquiryDocument = {
      ...doc,
      _id: doc._id.toString(),
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
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
    const filter: Record<string, any> = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    const raw = await Enquiry.find(filter).sort({ createdAt: -1 }).lean();
    return raw.map((d: any) => ({
      ...d,
      _id: d._id.toString(),
    })) as unknown as IEnquiryDocument[];
  } catch {
    let list = global.__enquiriesStore || [];
    if (status && status !== 'all') {
      list = list.filter((e) => e.status === status);
    }
    return list;
  }
}
