import { NextRequest, NextResponse } from 'next/server';
import { createTestRideBooking, getTestRideBookings } from '@/lib/testRideService';
import { getAdminSession } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.bikeId || !body.customerName || !body.phone || !body.email || !body.preferredDate || !body.preferredTime) {
      return NextResponse.json(
        { success: false, error: 'Please provide bike, name, phone, email, date, and preferred time.' },
        { status: 400 }
      );
    }

    if (body.drivingLicenseVerified === false) {
      return NextResponse.json(
        { success: false, error: 'Valid two-wheeler driving license confirmation is mandatory for test-rides.' },
        { status: 400 }
      );
    }

    const booking = await createTestRideBooking({
      bikeId: body.bikeId,
      customerName: body.customerName,
      phone: body.phone,
      email: body.email,
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime,
      drivingLicenseVerified: body.drivingLicenseVerified ?? true,
      location: body.location,
      message: body.message,
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to schedule test ride';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const filters = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    };

    const data = await getTestRideBookings(filters);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error retrieving test ride bookings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
