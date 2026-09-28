import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getSellRequests } from '@/lib/sellRequestService';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const sellRequests = await getSellRequests(status, search);

    return NextResponse.json({
      success: true,
      total: sellRequests.length,
      data: sellRequests,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch sell requests' },
      { status: 500 }
    );
  }
}
