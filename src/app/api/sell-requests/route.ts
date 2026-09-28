import { NextRequest, NextResponse } from 'next/server';
import { createSellRequest } from '@/lib/sellRequestService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ownerName,
      phone,
      email,
      carBrand,
      carModel,
      carYear,
      kilometers,
      fuelType,
      transmission,
      expectedPrice,
      location,
      message,
    } = body;

    // Reject attempt to set status or admin fields from client
    if (body.status && body.status !== 'New') {
      return NextResponse.json(
        { success: false, error: 'Status cannot be specified during initial request creation' },
        { status: 400 }
      );
    }

    const sellRequest = await createSellRequest({
      ownerName,
      phone,
      email,
      carBrand,
      carModel,
      carYear,
      kilometers,
      fuelType,
      transmission,
      expectedPrice,
      location,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Request Received. Our team will review your details and contact you.',
        data: sellRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API /api/sell-requests error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit sell request. Please check your inputs.',
      },
      { status: 400 }
    );
  }
}
