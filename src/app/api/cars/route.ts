import { NextRequest, NextResponse } from 'next/server';
import { getCars } from '@/lib/carsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const fuelType = searchParams.get('fuelType') || undefined;
    const transmission = searchParams.get('transmission') || undefined;
    const bodyType = searchParams.get('bodyType') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minYear = searchParams.get('minYear') ? Number(searchParams.get('minYear')) : undefined;
    const maxYear = searchParams.get('maxYear') ? Number(searchParams.get('maxYear')) : undefined;
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.has('featured')
      ? searchParams.get('featured') === 'true'
      : undefined;
    const status = searchParams.get('status') || 'Available';
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 12;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

    const result = await getCars({
      search,
      brand,
      fuelType,
      transmission,
      bodyType,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      sort,
      featured,
      status,
      limit,
      page,
    });

    return NextResponse.json({
      success: true,
      cars: result.cars,
      total: result.total,
      brands: result.brands,
      fuelTypes: result.fuelTypes,
      bodyTypes: result.bodyTypes,
      transmissions: result.transmissions,
      data: result.cars,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      },
      filters: {
        brands: result.brands,
        fuelTypes: result.fuelTypes,
        bodyTypes: result.bodyTypes,
        transmissions: result.transmissions,
      },
    });
  } catch (error) {
    console.error('API /api/cars error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}
