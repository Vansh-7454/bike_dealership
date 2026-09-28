import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getCarByIdOrSlug, updateCar, archiveCar, deleteCar } from '@/lib/carsService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { id } = await context.params;
    const car = await getCarByIdOrSlug(id);

    if (!car) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: car,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch vehicle' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateCar(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found or could not be updated' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Admin PUT /api/admin/cars/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update vehicle' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'archive';

    let success = false;
    if (action === 'delete') {
      success = await deleteCar(id);
    } else {
      success = await archiveCar(id);
    }

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Vehicle could not be removed or archived' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: action === 'delete' ? 'Vehicle permanently deleted' : 'Vehicle archived successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
