import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getBikeByIdOrSlug, updateBike, deleteBike } from '@/lib/bikesService';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { id } = await params;
    const bike = await getBikeByIdOrSlug(id);
    if (!bike) {
      return NextResponse.json({ success: false, error: 'Bike not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, bike });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error retrieving bike';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateBike(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Bike not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, bike: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update bike';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { id } = await params;
    const deleted = await deleteBike(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Bike not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Bike deleted successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete bike';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
