import connectToDatabase from './mongodb';
import TestDriveBooking, { ITestDriveBookingDocument } from '@/models/TestDriveBooking';
import { ICarSnapshot } from '@/models/Enquiry';
import { getCarByIdOrSlug } from './carsService';
import { isValidEmail, isValidPhone } from './enquiryService';

export interface CreateTestDriveInput {
  carId: string;
  customerName: string;
  phone: string;
  email: string;
  preferredDate: string | Date;
  preferredTime: string;
  location?: string;
  message?: string;
}

// Global hot-reload safe store for development / offline resilience
declare global {
  // eslint-disable-next-line no-var
  var __testDrivesStore: ITestDriveBookingDocument[] | undefined;
}

if (!global.__testDrivesStore) {
  global.__testDrivesStore = [];
}

/**
 * Create a new test drive booking with full server-side validation
 */
export async function createTestDriveBooking(input: CreateTestDriveInput): Promise<ITestDriveBookingDocument> {
  const { carId, customerName, phone, email, preferredDate, preferredTime, location, message } = input;

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
  if (!preferredDate) {
    throw new Error('Please select a preferred test-drive date');
  }
  if (!preferredTime) {
    throw new Error('Please select a preferred time slot');
  }

  // 2. Validate date is not in the past
  const parsedDate = new Date(preferredDate);
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Please enter a valid date');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(parsedDate);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate < today) {
    throw new Error('Test drive date cannot be in the past. Please select today or a future date.');
  }

  // 3. Verify car exists and build snapshot
  if (!carId || !carId.trim()) {
    throw new Error('A vehicle must be selected for a test-drive appointment');
  }

  const car = await getCarByIdOrSlug(carId.trim());
  if (!car) {
    throw new Error('The selected vehicle could not be located in our inventory');
  }

  const carSnapshot: ICarSnapshot = {
    title: car.title,
    brand: car.brand,
    model: car.model,
    price: car.price,
    year: car.year,
    primaryImage: car.images && car.images.length > 0 ? car.images[0] : '/images/inventory/xuv700_hero.jpg',
  };

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();
  const normalizedDateStr = typeof preferredDate === 'string' ? preferredDate.split('T')[0] : new Date(preferredDate).toISOString().split('T')[0];

  let isConnected = false;
  try {
    await connectToDatabase();
    isConnected = true;
  } catch (err) {
    console.warn('[Aureus Motors] MongoDB connection check in test-drive service:', err);
    isConnected = false;
  }

  if (isConnected) {
    // 4. Duplicate check: prevent same customer booking same car on same date & time slot
    const existing = await TestDriveBooking.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
      carId: car._id,
      preferredDate: {
        $gte: new Date(`${normalizedDateStr}T00:00:00.000Z`),
        $lt: new Date(`${normalizedDateStr}T23:59:59.999Z`),
      },
      preferredTime,
    }).lean();

    if (existing) {
      throw new Error(
        'You already have a pending test-drive reservation for this vehicle in that time slot. Our concierge will contact you to confirm.'
      );
    }

    // Force secure initial status to 'Pending'
    const newBooking = await TestDriveBooking.create({
      carId: car._id,
      carSnapshot,
      customerName: customerName.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      preferredDate: new Date(`${normalizedDateStr}T00:00:00.000Z`),
      preferredTime: preferredTime.trim(),
      location: location || 'Mumbai Flagship Studio (One BKC)',
      message: message ? message.trim() : '',
      status: 'Pending',
    });

    const doc: any = newBooking.toObject();
    const formatted: ITestDriveBookingDocument = {
      ...doc,
      _id: doc._id.toString(),
      preferredDate: new Date(doc.preferredDate),
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    };

    global.__testDrivesStore = [formatted, ...(global.__testDrivesStore || [])];
    return formatted;
  }

  // Fallback offline store
  const existingFallback = (global.__testDrivesStore || []).find((b) => {
    const bDate = typeof b.preferredDate === 'string' ? (b.preferredDate as string).split('T')[0] : new Date(b.preferredDate).toISOString().split('T')[0];
    return (
      (b.email === normalizedEmail || b.phone === normalizedPhone) &&
      (String(b.carId) === String(car._id) || String(b.carId) === String(car.slug)) &&
      bDate === normalizedDateStr &&
      b.preferredTime === preferredTime
    );
  });

  if (existingFallback) {
    throw new Error(
      'You already have a pending test-drive reservation for this vehicle in that time slot. Our concierge will contact you to confirm.'
    );
  }

  const now = new Date();
  const fallbackDoc: ITestDriveBookingDocument = {
    _id: `testdrive-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    carId: car._id,
    carSnapshot,
    customerName: customerName.trim(),
    phone: normalizedPhone,
    email: normalizedEmail,
    preferredDate: parsedDate,
    preferredTime: preferredTime.trim(),
    location: location || 'Mumbai Flagship Studio (One BKC)',
    message: message ? message.trim() : '',
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
  };

  global.__testDrivesStore = [fallbackDoc, ...(global.__testDrivesStore || [])];
  return fallbackDoc;
}

/**
 * Retrieve test-drive bookings with optional status filter
 */
export async function getTestDriveBookings(status?: string): Promise<ITestDriveBookingDocument[]> {
  try {
    await connectToDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    const raw = await TestDriveBooking.find(filter).sort({ createdAt: -1 }).lean();
    return raw.map((d: any) => ({
      ...d,
      _id: d._id.toString(),
      preferredDate: new Date(d.preferredDate),
    })) as unknown as ITestDriveBookingDocument[];
  } catch {
    let list = global.__testDrivesStore || [];
    if (status && status !== 'all') {
      list = list.filter((b) => b.status === status);
    }
    return list;
  }
}
