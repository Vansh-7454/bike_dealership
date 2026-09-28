import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getTestRideBookings, updateTestRideStatus } from '@/lib/testRideService';
import { TestRideStatus } from '@/models/TestRide';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = request.nextUrl;
    const filters = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 30,
    };

    const data = await getTestRideBookings(filters);
    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error retrieving test ride bookings';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status are required' }, { status: 400 });
    }

    const updated = await updateTestRideStatus(id, status as TestRideStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Test ride booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update test ride booking';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
