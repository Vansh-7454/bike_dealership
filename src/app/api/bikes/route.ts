import { NextRequest, NextResponse } from 'next/server';
import { getBikes, createBike } from '@/lib/bikesService';
import { getAdminSession } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters = {
      search: searchParams.get('search') || undefined,
      brand: searchParams.get('brand') || undefined,
      bikeType: searchParams.get('bikeType') || undefined,
      fuelType: searchParams.get('fuelType') || undefined,
      transmission: searchParams.get('transmission') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      minCc: searchParams.get('minCc') ? Number(searchParams.get('minCc')) : undefined,
      maxCc: searchParams.get('maxCc') ? Number(searchParams.get('maxCc')) : undefined,
      status: searchParams.get('status') || undefined,
      featuredOnly: searchParams.get('featured') === 'true',
      sort: searchParams.get('sort') || 'newest',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12,
    };

    const result = await getBikes(filters);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to retrieve bikes';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const newBike = await createBike(body);
    return NextResponse.json({ success: true, bike: newBike }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create bike listing';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
