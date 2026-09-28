import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getEnquiries, updateEnquiryStatus } from '@/lib/enquiryService';
import { EnquiryStatus } from '@/models/Enquiry';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 30;

    const result = await getEnquiries({ status, search, page, limit });

    return NextResponse.json({
      success: true,
      total: result.total,
      data: result.enquiries,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch enquiries';
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

    const updated = await updateEnquiryStatus(id, status as EnquiryStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, enquiry: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update enquiry status';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
