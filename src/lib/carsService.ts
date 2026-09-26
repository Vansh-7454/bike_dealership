import connectToDatabase from './mongodb';
import Car, { ICarDocument } from '@/models/Car';
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
    status = 'Available',
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted: any = {
        ...car,
        _id: (car as any)._id.toString(),
        createdAt: (car as any).createdAt
          ? new Date((car as any).createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: (car as any).updatedAt
          ? new Date((car as any).updatedAt).toISOString()
          : new Date().toISOString(),
      };
      return formatted as ICarDocument;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {
      ...found,
      _id: idOrSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
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
