import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getSellBikeRequests, updateSellBikeStatus } from '@/lib/sellBikeService';
import { SellBikeStatus } from '@/models/SellBikeRequest';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = request.nextUrl;
    const filters = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 30,
    };

    const data = await getSellBikeRequests(filters);
    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error retrieving sell bike requests';
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

    const updated = await updateSellBikeStatus(id, status as SellBikeStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Sell bike request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update sell bike request';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
