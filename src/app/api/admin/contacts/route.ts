import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getContactEnquiries, updateContactEnquiryStatus, deleteContactEnquiry } from '@/lib/contactService';
import { ContactEnquiryStatus } from '@/models/ContactEnquiry';

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

    const result = await getContactEnquiries({ status, search, page, limit });

    return NextResponse.json({
      success: true,
      total: result.total,
      data: result.enquiries,
      contacts: result.enquiries,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch contact submissions';
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

    const updated = await updateContactEnquiryStatus(id, status as ContactEnquiryStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Contact submission not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, contact: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update contact submission status';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const ok = await deleteContactEnquiry(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Contact submission not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete contact submission';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
