import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getEnquiries } from '@/lib/enquiryService';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search')?.toLowerCase().trim();

    let enquiries = await getEnquiries(status);

    if (search) {
      enquiries = enquiries.filter(
        (e) =>
          e.customerName.toLowerCase().includes(search) ||
          e.email.toLowerCase().includes(search) ||
          e.phone.includes(search) ||
          (e.carSnapshot?.title && e.carSnapshot.title.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      total: enquiries.length,
      data: enquiries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch enquiries' },
      { status: 500 }
    );
  }
}
