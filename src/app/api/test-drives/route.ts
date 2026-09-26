import { NextRequest, NextResponse } from 'next/server';
import { createTestDriveBooking, getTestDriveBookings } from '@/lib/testDriveService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, customerName, phone, email, preferredDate, preferredTime, location, message } = body;

    // Reject attempt to set status from client
    if (body.status && body.status !== 'Pending') {
      return NextResponse.json(
        { success: false, error: 'Status cannot be specified during initial test-drive request' },
        { status: 400 }
      );
    }

    const booking = await createTestDriveBooking({
      carId,
      customerName,
      phone,
      email,
      preferredDate,
      preferredTime,
      location,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your test-drive request has been received. Our concierge will confirm your appointment shortly.',
        data: booking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API /api/test-drives error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit test-drive request. Please try again.',
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const bookings = await getTestDriveBookings(status);

    return NextResponse.json({
      success: true,
      total: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve test-drive bookings' },
      { status: 500 }
    );
  }
}
