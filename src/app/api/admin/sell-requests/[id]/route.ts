import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { updateSellRequestStatus, deleteSellRequest } from '@/lib/sellRequestService';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    const allowed = ['New', 'Contacted', 'Closed'];
    if (!status || !allowed.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${allowed.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await updateSellRequestStatus(id, status);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Sell request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sell request status updated successfully',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update sell request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { id } = await context.params;
    const success = await deleteSellRequest(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Sell request not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sell request deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete sell request' },
      { status: 500 }
    );
  }
}
