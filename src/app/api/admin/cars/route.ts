import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getCars, createCar } from '@/lib/carsService';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const status = searchParams.get('status') || 'all'; // Default to all cars in admin
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    const result = await getCars({
      search,
      brand,
      status: status === 'all' ? undefined : status,
      page,
      limit,
      sort: 'newest',
    });

    return NextResponse.json({
      success: true,
      data: result.cars,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error: any) {
    console.error('Admin GET /api/admin/cars error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve vehicle inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();

    // Field validations
    const required = ['brand', 'model', 'year', 'price', 'fuelType', 'transmission', 'kilometers', 'bodyType'];
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          { success: false, error: `Field '${field}' is required.` },
          { status: 400 }
        );
      }
    }

    if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one vehicle image is required.' },
        { status: 400 }
      );
    }

    const created = await createCar(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Vehicle listing added successfully.',
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Admin POST /api/admin/cars error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add vehicle' },
      { status: 400 }
    );
  }
}
