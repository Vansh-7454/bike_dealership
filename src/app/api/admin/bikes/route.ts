import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getBikes, createBike } from '@/lib/bikesService';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = request.nextUrl;
    const filters = {
      search: searchParams.get('search') || undefined,
      brand: searchParams.get('brand') || undefined,
      status: searchParams.get('status') || undefined,
      sort: searchParams.get('sort') || 'newest',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 30,
    };

    const data = await getBikes(filters);
    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error retrieving admin bikes';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();
    const newBike = await createBike(body);
    return NextResponse.json({ success: true, bike: newBike }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create bike listing';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
