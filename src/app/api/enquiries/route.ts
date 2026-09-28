import { NextRequest, NextResponse } from 'next/server';
import { createEnquiry, getEnquiries } from '@/lib/enquiryService';
import { getAdminSession } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.phone || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Name, phone number, and email are required.' },
        { status: 400 }
      );
    }

    const enquiry = await createEnquiry({
      customerName: body.customerName,
      phone: body.phone,
      email: body.email,
      bikeId: body.bikeId || null,
      message: body.message,
      acquisitionPreference: body.acquisitionPreference,
      source: body.source,
    });

    return NextResponse.json({ success: true, enquiry }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to submit enquiry';
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

    const data = await getEnquiries(filters);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error retrieving enquiries';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
