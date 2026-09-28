import { NextRequest, NextResponse } from 'next/server';
import { createContactEnquiry, getContactEnquiries } from '@/lib/contactService';
import { getAdminSession } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.phone || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Full name, phone, email, and message are required.' },
        { status: 400 }
      );
    }

    const contact = await createContactEnquiry({
      name: body.name,
      phone: body.phone,
      email: body.email,
      topic: body.topic,
      preferredDate: body.preferredDate,
      message: body.message,
    });

    return NextResponse.json({ success: true, contact, enquiry: contact }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to send message';
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

    const data = await getContactEnquiries(filters);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error retrieving contact enquiries';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
