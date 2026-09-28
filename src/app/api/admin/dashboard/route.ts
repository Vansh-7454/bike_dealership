import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getAdminDashboardData } from '@/lib/dashboardService';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const data = await getAdminDashboardData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Admin dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve dashboard metrics' },
      { status: 500 }
    );
  }
}
