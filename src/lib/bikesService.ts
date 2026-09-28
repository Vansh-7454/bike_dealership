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
 * Seed initial motorcycle inventory if database collection is empty
 */
export async function seedInitialBikesIfEmpty(): Promise<void> {
  await connectToDatabase();
  const count = await Bike.countDocuments();
  if (count === 0) {
    try {
      await Bike.insertMany(INITIAL_BIKES_SEED);
      console.log(`[Torque Two-Wheelers] Seeded ${INITIAL_BIKES_SEED.length} verified motorcycles into inventory.`);
    } catch (err) {
      console.error('[Torque Two-Wheelers] Error seeding bikes:', err);
    }
  }
}

/**
 * Query bikes with rich filtering, text search, sorting, and pagination
 */
export async function getBikes(filters: BikeQueryFilters = {}): Promise<PaginatedBikesResult> {
  await connectToDatabase();
  await seedInitialBikesIfEmpty();

  const query: Record<string, unknown> = {};

  // Status filter (defaults to non-archived for public storefront)
  if (filters.status && filters.status !== 'All') {
    query.status = filters.status;
  } else {
    query.status = { $ne: 'Archived' };
  }

  // Text search on title, brand, model, variant, description
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

  const [bikes, total] = await Promise.all([
    Bike.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
    Bike.countDocuments(query),
  ]);

  // Aggregate distinct filter categories
  const [brands, bikeTypes, fuelTypes] = await Promise.all([
    Bike.distinct('brand', { status: { $ne: 'Archived' } }),
    Bike.distinct('bikeType', { status: { $ne: 'Archived' } }),
    Bike.distinct('fuelType', { status: { $ne: 'Archived' } }),
  ]);

  return {
    bikes: JSON.parse(JSON.stringify(bikes)),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    brands: brands.sort(),
    bikeTypes: bikeTypes.sort(),
    fuelTypes: fuelTypes.sort(),
  };
}

/**
 * Retrieve a bike by its MongoDB _id or slug
 */
export async function getBikeByIdOrSlug(idOrSlug: string): Promise<IBikeDocument | null> {
  await connectToDatabase();
  await seedInitialBikesIfEmpty();

  let bike = null;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    bike = await Bike.findById(idOrSlug).lean();
  }

  if (!bike) {
    bike = await Bike.findOne({ slug: idOrSlug.trim() }).lean();
  }

  return bike ? JSON.parse(JSON.stringify(bike)) : null;
}

/**
 * Create a new bike in the inventory
 */
export async function createBike(bikeData: Partial<IBikeItem>): Promise<IBikeDocument> {
  await connectToDatabase();

  if (!bikeData.slug && bikeData.title) {
    const baseSlug = bikeData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    bikeData.slug = `${baseSlug}-${randomSuffix}`;
  }

  const newBike = await Bike.create(bikeData);
  return JSON.parse(JSON.stringify(newBike));
}

/**
 * Update bike by ID
 */
export async function updateBike(
  id: string,
  updateData: Partial<IBikeItem>
): Promise<IBikeDocument | null> {
  await connectToDatabase();
  const updated = await Bike.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).lean();
  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

/**
 * Delete bike by ID
 */
export async function deleteBike(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await Bike.findByIdAndDelete(id);
  return Boolean(result);
}
