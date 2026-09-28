import { NextRequest, NextResponse } from 'next/server';
import { getBikeByIdOrSlug, updateBike, deleteBike } from '@/lib/bikesService';
import { getAdminSession } from '@/lib/adminAuth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const bike = await getBikeByIdOrSlug(id);
    if (!bike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, bike, ...bike });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error fetching bike';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const admin = await getAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const updated = await updateBike(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, bike: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update bike';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const admin = await getAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteBike(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Bike not found or delete failed' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Bike listing removed' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete bike';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
