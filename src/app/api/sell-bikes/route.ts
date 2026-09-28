import { NextRequest, NextResponse } from 'next/server';
import { createSellBikeRequest, getSellBikeRequests } from '@/lib/sellBikeService';
import { getAdminSession } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const brand = body.brand || body.bikeBrand;
    const model = body.model || body.bikeModel;
    const year = body.year || body.bikeYear;

    if (
      !body.ownerName ||
      !body.phone ||
      !body.email ||
      !brand ||
      !model ||
      !year ||
      body.kilometers === undefined ||
      !body.location
    ) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required motorcycle details.' },
        { status: 400 }
      );
    }

    const sellRequest = await createSellBikeRequest({
      ownerName: body.ownerName,
      phone: body.phone,
      email: body.email,
      brand,
      model,
      variant: body.variant,
      year: Number(year),
      kilometers: Number(body.kilometers),
      fuelType: body.fuelType || 'Petrol',
      transmission: body.transmission || 'Manual',
      bikeType: body.bikeType || 'Street / Naked',
      engineCC: body.engineCC ? Number(body.engineCC) : undefined,
      expectedPrice: body.expectedPrice ? Number(body.expectedPrice) : null,
      location: body.location,
      message: body.message,
    });

    return NextResponse.json({ success: true, sellRequest, request: sellRequest }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to submit sell request';
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

    const data = await getSellBikeRequests(filters);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error retrieving sell bike requests';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
