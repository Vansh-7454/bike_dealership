import mongoose from 'mongoose';
import connectToDatabase from './mongodb';
import Bike, { IBikeItem, IBikeDocument } from '@/models/Bike';
import { INITIAL_BIKES_SEED } from './seedData';

export interface BikeQueryFilters {
  search?: string;
  brand?: string;
  bikeType?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  minCc?: number;
  maxCc?: number;
  status?: string;
  featuredOnly?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedBikesResult {
  bikes: IBikeDocument[];
  total: number;
  page: number;
  totalPages: number;
  brands: string[];
  bikeTypes: string[];
  fuelTypes: string[];
}

/**
 * In-memory fallback dataset for serverless environments (e.g. Vercel)
 * when a remote MongoDB instance is not connected.
 */
let inMemoryBikesStore: IBikeDocument[] = INITIAL_BIKES_SEED.map((seed, idx) => {
  const seedId = `verified-seed-${idx + 1}`;
  return {
    _id: seedId as unknown as mongoose.Types.ObjectId,
    id: seedId,
    ...seed,
    createdAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
  } as unknown as IBikeDocument;
});

/**
 * Filter and paginate in-memory bikes store
 */
function getInMemoryBikes(filters: BikeQueryFilters = {}): PaginatedBikesResult {
  let filtered = [...inMemoryBikesStore];

  // Exclude archived bikes by default
  if (filters.status && filters.status !== 'All') {
    filtered = filtered.filter((b) => b.status === filters.status);
  } else {
    filtered = filtered.filter((b) => b.status !== 'Archived');
  }

  // Ensure pulsar entries are excluded
  filtered = filtered.filter((b) => !b.slug?.toLowerCase().includes('pulsar') && !b.model?.toLowerCase().includes('pulsar'));

  // Text search
  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim().toLowerCase();
    filtered = filtered.filter(
      (b) =>
        (b.title || '').toLowerCase().includes(term) ||
        (b.brand || '').toLowerCase().includes(term) ||
        (b.model || '').toLowerCase().includes(term) ||
        (b.variant || '').toLowerCase().includes(term) ||
        (b.description || '').toLowerCase().includes(term)
    );
  }

  // Brand filter
  if (filters.brand && filters.brand !== 'All') {
    const targetBrand = filters.brand.toLowerCase();
    filtered = filtered.filter((b) => b.brand?.toLowerCase() === targetBrand);
  }

  // Category filter
  if (filters.bikeType && filters.bikeType !== 'All') {
    const targetType = filters.bikeType.toLowerCase();
    filtered = filtered.filter((b) => b.bikeType?.toLowerCase() === targetType);
  }

  // Fuel type filter
  if (filters.fuelType && filters.fuelType !== 'All') {
    const targetFuel = filters.fuelType.toLowerCase();
    filtered = filtered.filter((b) => b.fuelType?.toLowerCase() === targetFuel);
  }

  // Transmission filter
  if (filters.transmission && filters.transmission !== 'All') {
    const targetTrans = filters.transmission.toLowerCase();
    filtered = filtered.filter((b) => b.transmission?.toLowerCase() === targetTrans);
  }

  // Featured only
  if (filters.featuredOnly) {
    filtered = filtered.filter((b) => Boolean(b.featured));
  }

  // Price range
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((b) => (b.price || 0) >= (filters.minPrice ?? 0));
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((b) => (b.price || 0) <= (filters.maxPrice ?? Infinity));
  }

  // Engine CC range
  if (filters.minCc !== undefined) {
    filtered = filtered.filter((b) => (b.engineCC || 0) >= (filters.minCc ?? 0));
  }
  if (filters.maxCc !== undefined) {
    filtered = filtered.filter((b) => (b.engineCC || 0) <= (filters.maxCc ?? Infinity));
  }

  // Sort
  switch (filters.sort) {
    case 'price_asc':
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price_desc':
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'km_asc':
      filtered.sort((a, b) => (a.kilometers || 0) - (b.kilometers || 0));
      break;
    case 'year_desc':
      filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
      break;
    case 'engine_desc':
      filtered.sort((a, b) => (b.engineCC || 0) - (a.engineCC || 0));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      break;
  }

  // Categories for UI dropdowns
  const availableBikes = inMemoryBikesStore.filter((b) => b.status !== 'Archived');
  const brands = Array.from(new Set(availableBikes.map((b) => b.brand).filter(Boolean))).sort();
  const bikeTypes = Array.from(new Set(availableBikes.map((b) => b.bikeType).filter(Boolean))).sort();
  const fuelTypes = Array.from(new Set(availableBikes.map((b) => b.fuelType).filter(Boolean))).sort();

  // Pagination
  const total = filtered.length;
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 12));
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    bikes: JSON.parse(JSON.stringify(paginated)),
    total,
    page,
    totalPages,
    brands: brands.length ? brands : ['KTM', 'Royal Enfield', 'TVS', 'Yamaha'],
    bikeTypes: bikeTypes.length ? bikeTypes : ['Commuter', 'Cruiser', 'Street / Naked'],
    fuelTypes: fuelTypes.length ? fuelTypes : ['Petrol'],
  };
}

/**
 * Seed initial motorcycle inventory if database collection is empty
 */
export async function seedInitialBikesIfEmpty(): Promise<void> {
  try {
    await connectToDatabase();

    // 1. Purge any deprecated Pulsar records completely from database
    try {
      await Bike.deleteMany({
        $or: [
          { model: { $regex: 'pulsar', $options: 'i' } },
          { title: { $regex: 'pulsar', $options: 'i' } },
          { slug: { $regex: 'pulsar', $options: 'i' } },
          { images: { $elemMatch: { $regex: 'pulsar', $options: 'i' } } },
        ],
      });
    } catch (err) {
      console.error('[Torque Two-Wheelers] Error removing deprecated pulsar entries:', err);
    }

    // 2. Ensure each seed bike is present, updated, and deduplicated
    try {
      for (const seed of INITIAL_BIKES_SEED) {
        if (seed.slug) {
          const existingList = await Bike.find({ slug: seed.slug });
          if (existingList.length === 0) {
            await Bike.create(seed);
          } else {
            if (existingList.length > 1) {
              const extraIds = existingList.slice(1).map((b) => b._id);
              await Bike.deleteMany({ _id: { $in: extraIds } });
            }
            await Bike.updateOne({ _id: existingList[0]._id }, { $set: seed });
          }
        }
      }
    } catch (err) {
      console.error('[Torque Two-Wheelers] Error synchronizing clean bikes seed:', err);
    }
  } catch (err) {
    // If DB is offline, seedInitialBikesIfEmpty cleanly completes without crashing
    console.warn('[Torque Two-Wheelers] DB connection unavailable during seed check, continuing with memory store.');
  }
}

/**
 * Query bikes with rich filtering, text search, sorting, and pagination.
 * Gracefully and automatically falls back to in-memory store if MongoDB is offline or unavailable.
 */
export async function getBikes(filters: BikeQueryFilters = {}): Promise<PaginatedBikesResult> {
  try {
    await connectToDatabase();
    await seedInitialBikesIfEmpty();

    const query: Record<string, unknown> = {};

    // Status filter
    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    } else {
      query.status = { $ne: 'Archived' };
    }

    // Ensure deprecated pulsar records are never returned
    query.slug = { $not: /pulsar/i };

    // Text search
    if (filters.search && filters.search.trim()) {
      const term = filters.search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { brand: { $regex: term, $options: 'i' } },
        { model: { $regex: term, $options: 'i' } },
        { variant: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    // Categorical filters
    if (filters.brand && filters.brand !== 'All') {
      query.brand = filters.brand;
    }

    if (filters.bikeType && filters.bikeType !== 'All') {
      query.bikeType = filters.bikeType;
    }

    if (filters.fuelType && filters.fuelType !== 'All') {
      query.fuelType = filters.fuelType;
    }

    if (filters.transmission && filters.transmission !== 'All') {
      query.transmission = filters.transmission;
    }

    if (filters.featuredOnly) {
      query.featured = true;
    }

    // Price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (filters.minPrice !== undefined) priceFilter.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) priceFilter.$lte = filters.maxPrice;
      query.price = priceFilter;
    }

    // Engine CC range
    if (filters.minCc !== undefined || filters.maxCc !== undefined) {
      const ccFilter: Record<string, number> = {};
      if (filters.minCc !== undefined) ccFilter.$gte = filters.minCc;
      if (filters.maxCc !== undefined) ccFilter.$lte = filters.maxCc;
      query.engineCC = ccFilter;
    }

    // Sorting
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    switch (filters.sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'km_asc':
        sortOption = { kilometers: 1 };
        break;
      case 'year_desc':
        sortOption = { year: -1 };
        break;
      case 'engine_desc':
        sortOption = { engineCC: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Pagination
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 12));
    const skip = (page - 1) * limit;

    let [bikes, total] = await Promise.all([
      Bike.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
      Bike.countDocuments(query),
    ]);

    // If database returned 0 results on cold load without search/brand filters, attempt re-seed
    if (total === 0 && !filters.search && (!filters.brand || filters.brand === 'All')) {
      try {
        await Bike.insertMany(INITIAL_BIKES_SEED);
        [bikes, total] = await Promise.all([
          Bike.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
          Bike.countDocuments(query),
        ]);
      } catch {
        // Continue
      }
    }

    // Aggregate distinct filter categories
    const [brands, bikeTypes, fuelTypes] = await Promise.all([
      Bike.distinct('brand', { status: { $ne: 'Archived' } }),
      Bike.distinct('bikeType', { status: { $ne: 'Archived' } }),
      Bike.distinct('fuelType', { status: { $ne: 'Archived' } }),
    ]);

    const cleanBrands = brands.filter((b) => !b.toLowerCase().includes('bajaj')).sort();

    if (bikes.length === 0 && !filters.search && (!filters.brand || filters.brand === 'All')) {
      return getInMemoryBikes(filters);
    }

    return {
      bikes: JSON.parse(JSON.stringify(bikes)),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      brands: cleanBrands.length ? cleanBrands : ['KTM', 'Royal Enfield', 'TVS', 'Yamaha'],
      bikeTypes: bikeTypes.sort(),
      fuelTypes: fuelTypes.sort(),
    };
  } catch (error) {
    console.warn('[Torque Two-Wheelers] Database query failed or unavailable, using resilient in-memory store:', (error as Error).message);
    return getInMemoryBikes(filters);
  }
}

/**
 * Retrieve a bike by its MongoDB _id, id, or slug.
 * Seamlessly checks in-memory store if DB is offline.
 */
export async function getBikeByIdOrSlug(idOrSlug: string): Promise<IBikeDocument | null> {
  const cleanTerm = idOrSlug.trim();

  try {
    await connectToDatabase();
    await seedInitialBikesIfEmpty();

    let bike = null;
    if (mongoose.Types.ObjectId.isValid(cleanTerm)) {
      bike = await Bike.findById(cleanTerm).lean();
    }

    if (!bike) {
      bike = await Bike.findOne({ slug: cleanTerm }).lean();
    }

    if (bike) {
      return JSON.parse(JSON.stringify(bike));
    }
  } catch (err) {
    console.warn('[Torque Two-Wheelers] DB query failed for getBikeByIdOrSlug, querying memory store:', (err as Error).message);
  }

  // Fallback to in-memory store
  const match = inMemoryBikesStore.find(
    (b) =>
      String(b._id).toLowerCase() === cleanTerm.toLowerCase() ||
      String((b as unknown as { id?: string }).id || '').toLowerCase() === cleanTerm.toLowerCase() ||
      b.slug?.toLowerCase() === cleanTerm.toLowerCase()
  );

  return match ? JSON.parse(JSON.stringify(match)) : null;
}

/**
 * Create a new bike in the inventory
 */
export async function createBike(bikeData: Partial<IBikeItem>): Promise<IBikeDocument> {
  if (!bikeData.slug && bikeData.title) {
    const baseSlug = bikeData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    bikeData.slug = `${baseSlug}-${randomSuffix}`;
  }

  try {
    await connectToDatabase();
    const newBike = await Bike.create(bikeData);
    return JSON.parse(JSON.stringify(newBike));
  } catch (err) {
    console.warn('[Torque Two-Wheelers] DB unavailable for createBike, saving to memory store:', (err as Error).message);
    const newId = `bike-${Date.now()}`;
    const newMemoryBike = {
      _id: newId as unknown as mongoose.Types.ObjectId,
      id: newId,
      ...bikeData,
      status: bikeData.status || 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as IBikeDocument;
    inMemoryBikesStore.unshift(newMemoryBike);
    return newMemoryBike;
  }
}

/**
 * Update bike by ID
 */
export async function updateBike(
  id: string,
  updateData: Partial<IBikeItem>
): Promise<IBikeDocument | null> {
  try {
    await connectToDatabase();
    const updated = await Bike.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).lean();
    if (updated) {
      return JSON.parse(JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('[Torque Two-Wheelers] DB unavailable for updateBike, updating memory store:', (err as Error).message);
  }

  const idx = inMemoryBikesStore.findIndex(
    (b) =>
      String(b._id) === id ||
      String((b as unknown as { id?: string }).id) === id ||
      b.slug === id
  );
  if (idx !== -1) {
    inMemoryBikesStore[idx] = {
      ...inMemoryBikesStore[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    } as unknown as IBikeDocument;
    return inMemoryBikesStore[idx];
  }

  return null;
}

/**
 * Delete bike by ID
 */
export async function deleteBike(id: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const result = await Bike.findByIdAndDelete(id);
    if (result) return true;
  } catch (err) {
    console.warn('[Torque Two-Wheelers] DB unavailable for deleteBike, removing from memory store:', (err as Error).message);
  }

  const prevLen = inMemoryBikesStore.length;
  inMemoryBikesStore = inMemoryBikesStore.filter(
    (b) =>
      String(b._id) !== id &&
      String((b as unknown as { id?: string }).id) !== id &&
      b.slug !== id
  );
  return inMemoryBikesStore.length < prevLen;
}
