import connectToDatabase from './mongodb';
import Car, { ICarDocument, ICarItem, FuelType, TransmissionType, BodyType, VehicleStatus } from '@/models/Car';
import { DEMO_CARS } from './seedData';

export interface CarFilterOptions {
  search?: string;
  brand?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  sort?: string;
  featured?: boolean;
  status?: string;
  limit?: number;
  page?: number;
}

export interface PaginatedCarsResult {
  cars: ICarDocument[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  brands: string[];
  fuelTypes: string[];
  bodyTypes: string[];
  transmissions: string[];
}

/**
 * Ensure database is connected and seeded with demo inventory if empty
 */
export async function seedCarsIfEmpty(): Promise<number> {
  try {
    await connectToDatabase();
    const count = await Car.countDocuments();
    if (count === 0) {
      await Car.insertMany(DEMO_CARS);
      return DEMO_CARS.length;
    }
    return count;
  } catch (error) {
    console.warn('[Aureus Motors] MongoDB connection check or seeding:', error);
    return DEMO_CARS.length;
  }
}

/**
 * Query cars from MongoDB with robust filtering, search, and sorting
 */
export async function getCars(options: CarFilterOptions = {}): Promise<PaginatedCarsResult> {
  const {
    search,
    brand,
    fuelType,
    transmission,
    bodyType,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    sort = 'newest',
    featured,
    status,
    limit = 12,
    page = 1,
  } = options;

  let isMongoConnected = false;

  try {
    await connectToDatabase();
    await seedCarsIfEmpty();
    isMongoConnected = true;
  } catch (err) {
    console.warn('[Aureus Motors] Operating with in-memory store (MongoDB connection pending):', err);
    isMongoConnected = false;
  }

  if (isMongoConnected) {
    // Build real MongoDB query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (status && status !== 'all') {
      query.status = status;
    } else if (status !== 'all') {
      query.status = { $ne: 'Archived' };
    }

    if (featured !== undefined) {
      query.featured = featured;
    }

    if (brand && brand !== 'All') {
      query.brand = new RegExp(`^${brand}$`, 'i');
    }

    if (fuelType && fuelType !== 'All') {
      query.fuelType = fuelType;
    }

    if (transmission && transmission !== 'All') {
      query.transmission = transmission;
    }

    if (bodyType && bodyType !== 'All') {
      query.bodyType = bodyType;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    if (minYear !== undefined || maxYear !== undefined) {
      query.year = {};
      if (minYear !== undefined) query.year.$gte = minYear;
      if (maxYear !== undefined) query.year.$lte = maxYear;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { brand: searchRegex },
        { model: searchRegex },
        { variant: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
      ];
    }

    // Build sort options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortOptions: Record<string, any> = { createdAt: -1 };
    switch (sort) {
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      case 'km_asc':
        sortOptions = { kilometers: 1 };
        break;
      case 'year_desc':
        sortOptions = { year: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1, _id: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [rawCars, total, distinctBrands, distinctFuel, distinctBody, distinctTrans] =
      await Promise.all([
        Car.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
        Car.countDocuments(query),
        Car.distinct('brand'),
        Car.distinct('fuelType'),
        Car.distinct('bodyType'),
        Car.distinct('transmission'),
      ]);

    // Map _id to string for clean serialization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cars = rawCars.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
    })) as unknown as ICarDocument[];

    return {
      cars,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: skip + cars.length < total,
      brands: distinctBrands.sort(),
      fuelTypes: distinctFuel.sort(),
      bodyTypes: distinctBody.sort(),
      transmissions: distinctTrans.sort(),
    };
  }

  // Graceful fallback if MongoDB service is not actively bound
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filtered = [...DEMO_CARS] as any[];

  if (status && status !== 'all') {
    filtered = filtered.filter((c) => c.status === status);
  } else if (status !== 'all') {
    filtered = filtered.filter((c) => c.status !== 'Archived');
  }

  if (featured !== undefined) {
    filtered = filtered.filter((c) => c.featured === featured);
  }

  if (brand && brand !== 'All') {
    filtered = filtered.filter((c) => c.brand.toLowerCase() === brand.toLowerCase());
  }

  if (fuelType && fuelType !== 'All') {
    filtered = filtered.filter((c) => c.fuelType.toLowerCase() === fuelType.toLowerCase());
  }

  if (transmission && transmission !== 'All') {
    filtered = filtered.filter(
      (c) => c.transmission.toLowerCase() === transmission.toLowerCase()
    );
  }

  if (bodyType && bodyType !== 'All') {
    filtered = filtered.filter((c) => c.bodyType.toLowerCase() === bodyType.toLowerCase());
  }

  if (minPrice !== undefined) {
    filtered = filtered.filter((c) => c.price >= minPrice);
  }

  if (maxPrice !== undefined) {
    filtered = filtered.filter((c) => c.price <= maxPrice);
  }

  if (minYear !== undefined) {
    filtered = filtered.filter((c) => c.year >= minYear);
  }

  if (maxYear !== undefined) {
    filtered = filtered.filter((c) => c.year <= maxYear);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.variant.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  switch (sort) {
    case 'price_asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'km_asc':
      filtered.sort((a, b) => a.kilometers - b.kilometers);
      break;
    case 'year_desc':
      filtered.sort((a, b) => b.year - a.year);
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => b.year - a.year);
      break;
  }

  const total = filtered.length;
  const skip = (page - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cars = paginated.map((c: any, index: number) => ({
    ...c,
    _id: c._id || `demo-${index + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })) as unknown as ICarDocument[];

  const brands = Array.from(new Set(DEMO_CARS.map((c) => c.brand))).sort();
  const fuelTypes = Array.from(new Set(DEMO_CARS.map((c) => c.fuelType))).sort();
  const bodyTypes = Array.from(new Set(DEMO_CARS.map((c) => c.bodyType))).sort();
  const transmissions = Array.from(new Set(DEMO_CARS.map((c) => c.transmission))).sort();

  return {
    cars,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    hasMore: skip + cars.length < total,
    brands,
    fuelTypes,
    bodyTypes,
    transmissions,
  };
}

/**
 * Fetch a single car by its MongoDB ObjectId or Slug
 */
export async function getCarByIdOrSlug(idOrSlug: string): Promise<ICarDocument | null> {
  try {
    await connectToDatabase();
    await seedCarsIfEmpty();

    let car = null;
    // Check if valid ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
      car = await Car.findById(idOrSlug).lean();
    }

    if (!car) {
      car = await Car.findOne({ slug: idOrSlug }).lean();
    }

    if (!car) {
      // Fallback search by title slug or demo id
      car = await Car.findOne({ title: new RegExp(idOrSlug.replace(/-/g, ' '), 'i') }).lean();
    }

    if (car) {
      const doc = car as unknown as Record<string, unknown>;
      const formatted: ICarDocument = {
        ...(doc as unknown as ICarDocument),
        _id: String(doc._id),
        createdAt: doc.createdAt
          ? new Date(doc.createdAt as string | Date)
          : new Date(),
        updatedAt: doc.updatedAt
          ? new Date(doc.updatedAt as string | Date)
          : new Date(),
      };
      return formatted;
    }
  } catch (err) {
    console.warn('[Aureus Motors] Database lookup error, checking fallback store:', err);
  }

  // Fallback to demo items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = DEMO_CARS.find(
    (c, idx) =>
      c.slug === idOrSlug ||
      `demo-${idx + 1}` === idOrSlug ||
      c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === idOrSlug.toLowerCase()
  );

  if (found) {
    const fallbackCar: ICarDocument = {
      ...(found as unknown as ICarDocument),
      _id: idOrSlug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return fallbackCar;
  }

  return null;
}

/**
 * Fetch featured cars for homepage
 */
export async function getFeaturedCars(limit: number = 4): Promise<ICarDocument[]> {
  const result = await getCars({ featured: true, limit });
  if (result.cars.length === 0) {
    const fallback = await getCars({ limit });
    return fallback.cars;
  }
  return result.cars;
}

/**
 * Generate a unique URL slug for a vehicle
 */
export function generateCarSlug(brand: string, model: string, year: number, variant?: string): string {
  const base = `${year}-${brand}-${model}${variant ? `-${variant}` : ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${base}-${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * Create a new vehicle listing in MongoDB
 */
export async function createCar(carData: Partial<ICarItem> & Record<string, unknown>): Promise<ICarDocument> {
  await connectToDatabase();
  await seedCarsIfEmpty();

  const brand = (carData.brand as string)?.trim() || 'Aureus';
  const model = (carData.model as string)?.trim() || 'Model';
  const year = Number(carData.year) || new Date().getFullYear();
  const variant = (carData.variant as string)?.trim() || '';
  const title = (carData.title as string)?.trim() || `${brand} ${model} ${variant}`.trim();
  const slug = (carData.slug as string)?.trim() || generateCarSlug(brand, model, year, variant);

  const docToInsert = {
    title,
    slug,
    brand,
    model,
    variant,
    year,
    price: Number(carData.price) || 0,
    fuelType: (carData.fuelType as FuelType) || 'Petrol',
    transmission: (carData.transmission as TransmissionType) || 'Automatic',
    kilometers: Number(carData.kilometers) || 0,
    bodyType: (carData.bodyType as BodyType) || 'SUV',
    color: (carData.color as string)?.trim() || 'Black',
    ownership: (carData.ownership as string)?.trim() || '1st Owner',
    location: (carData.location as string)?.trim() || 'Mumbai Studio',
    description: (carData.description as string)?.trim() || '',
    features: Array.isArray(carData.features)
      ? (carData.features as string[])
      : typeof carData.features === 'string'
      ? (carData.features as string).split(',').map((f: string) => f.trim()).filter(Boolean)
      : [],
    images: Array.isArray(carData.images) && (carData.images as string[]).length > 0
      ? (carData.images as string[])
      : ['/images/inventory/xuv700_hero.jpg'],
    featured: Boolean(carData.featured),
    status: (carData.status as VehicleStatus) || 'Available',
    inspectionScore: Number(carData.inspectionScore) || 160,
    registrationState: (carData.registrationState as string)?.trim() || 'MH',
  };

  try {
    const created = await Car.create(docToInsert);
    const obj = created.toObject() as unknown as Record<string, unknown>;
    return {
      ...(obj as unknown as ICarDocument),
      _id: String(obj._id),
      createdAt: obj.createdAt ? new Date(obj.createdAt as string | Date) : new Date(),
      updatedAt: obj.updatedAt ? new Date(obj.updatedAt as string | Date) : new Date(),
    };
  } catch {
    // If running in pure offline fallback
    const fallbackId = `car-${Date.now()}`;
    const fallbackCar: ICarDocument = {
      ...(docToInsert as unknown as ICarDocument),
      _id: fallbackId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    DEMO_CARS.unshift(fallbackCar as unknown as typeof DEMO_CARS[0]);
    return fallbackCar;
  }
}

/**
 * Update an existing vehicle in MongoDB
 */
export async function updateCar(id: string, carData: Partial<ICarItem> & Record<string, unknown>): Promise<ICarDocument | null> {
  await connectToDatabase();
  await seedCarsIfEmpty();

  const updateFields: Record<string, unknown> = { ...carData };
  delete updateFields._id;
  delete updateFields.id;

  if (updateFields.price) updateFields.price = Number(updateFields.price);
  if (updateFields.year) updateFields.year = Number(updateFields.year);
  if (updateFields.kilometers) updateFields.kilometers = Number(updateFields.kilometers);
  if (typeof updateFields.features === 'string') {
    updateFields.features = (updateFields.features as string).split(',').map((f: string) => f.trim()).filter(Boolean);
  }

  try {
    let updated = null;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      updated = await Car.findByIdAndUpdate(id, { $set: updateFields }, { new: true, lean: true });
    }
    if (!updated) {
      updated = await Car.findOneAndUpdate({ slug: id }, { $set: updateFields }, { new: true, lean: true });
    }

    if (updated) {
      const u = updated as unknown as Record<string, unknown>;
      return {
        ...(u as unknown as ICarDocument),
        _id: String(u._id),
        createdAt: u.createdAt ? new Date(u.createdAt as string | Date) : new Date(),
        updatedAt: u.updatedAt ? new Date(u.updatedAt as string | Date) : new Date(),
      };
    }
  } catch (err) {
    console.warn('[Aureus Motors] updateCar MongoDB error:', err);
  }

  // Fallback memory update
  const idx = DEMO_CARS.findIndex((c, i) => c.slug === id || `demo-${i + 1}` === id);
  if (idx !== -1) {
    const existing = DEMO_CARS[idx];
    const merged = { ...existing, ...updateFields, updatedAt: new Date() };
    DEMO_CARS[idx] = merged as unknown as typeof DEMO_CARS[0];
    return { ...(merged as unknown as ICarDocument), _id: id };
  }

  return null;
}

/**
 * Change vehicle status (e.g. Available <-> Sold or Archived)
 */
export async function updateCarStatus(id: string, status: VehicleStatus | string): Promise<ICarDocument | null> {
  return updateCar(id, { status: status as VehicleStatus });
}

/**
 * Archive a vehicle (safe soft-removal preserving relationship integrity)
 */
export async function archiveCar(id: string): Promise<boolean> {
  const result = await updateCar(id, { status: 'Archived' });
  return !!result;
}

/**
 * Delete a vehicle permanently
 */
export async function deleteCar(id: string): Promise<boolean> {
  await connectToDatabase();
  try {
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      const res = await Car.findByIdAndDelete(id);
      if (res) return true;
    }
    const res = await Car.findOneAndDelete({ slug: id });
    return !!res;
  } catch {
    const idx = DEMO_CARS.findIndex((c, i) => c.slug === id || `demo-${i + 1}` === id);
    if (idx !== -1) {
      DEMO_CARS.splice(idx, 1);
      return true;
    }
    return false;
  }
}
