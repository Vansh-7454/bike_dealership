import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getTestDriveBookings } from '@/lib/testDriveService';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search')?.toLowerCase().trim();

    let bookings = await getTestDriveBookings(status);

    if (search) {
      bookings = bookings.filter(
        (b) =>
          b.customerName.toLowerCase().includes(search) ||
          b.email.toLowerCase().includes(search) ||
          b.phone.includes(search) ||
          (b.carSnapshot?.title && b.carSnapshot.title.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      total: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch test-drive bookings' },
      { status: 500 }
    );
  }
}
