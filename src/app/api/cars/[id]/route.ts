import { NextRequest, NextResponse } from 'next/server';
import { getCarByIdOrSlug } from '@/lib/carsService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Vehicle identifier required' },
        { status: 400 }
      );
    }

    const car = await getCarByIdOrSlug(id);

    if (!car) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      car,
      data: car,
      ...car,
    });
  } catch (error) {
    console.error('API /api/cars/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve vehicle details' },
      { status: 500 }
    );
  }
}
