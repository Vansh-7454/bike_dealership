import { NextRequest, NextResponse } from 'next/server';
import { createEnquiry, getEnquiries } from '@/lib/enquiryService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, phone, email, carId, message, acquisitionPreference, source } = body;

    // Reject attempt to set status or admin fields from client
    if (body.status && body.status !== 'New') {
      return NextResponse.json(
        { success: false, error: 'Status cannot be specified during initial enquiry creation' },
        { status: 400 }
      );
    }

    const enquiry = await createEnquiry({
      customerName,
      phone,
      email,
      carId,
      message,
      acquisitionPreference,
      source,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been logged. Our concierge will be in touch shortly.',
        data: enquiry,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API /api/enquiries error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit inquiry. Please try again.',
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const enquiries = await getEnquiries(status);

    return NextResponse.json({
      success: true,
      total: enquiries.length,
      data: enquiries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve enquiries' },
      { status: 500 }
    );
  }
}
