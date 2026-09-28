import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({
        success: true,
        mode: 'in-memory',
        databaseName: 'in-memory-fallback',
        collections: ['bikes', 'enquiries', 'test_rides', 'sell_bike_requests', 'contact_enquiries'],
        counts: {
          bikes: 5,
          enquiries: 0,
          test_rides: 0,
          sell_bike_requests: 0,
          contact_enquiries: 0,
        },
      });
    }

    const collections = (await db.listCollections().toArray()).map((c) => c.name);

    return NextResponse.json({
      success: true,
      mode: 'mongodb',
      databaseName: db.databaseName,
      collections,
      counts: {
        bikes: collections.includes('bikes') ? await db.collection('bikes').countDocuments() : 0,
        enquiries: collections.includes('enquiries') ? await db.collection('enquiries').countDocuments() : 0,
        test_rides: collections.includes('test_rides') ? await db.collection('test_rides').countDocuments() : 0,
        sell_bike_requests: collections.includes('sell_bike_requests') ? await db.collection('sell_bike_requests').countDocuments() : 0,
        contact_enquiries: collections.includes('contact_enquiries') ? await db.collection('contact_enquiries').countDocuments() : 0,
      },
    });
  } catch (error: unknown) {
    console.warn('[Torque Two-Wheelers] DB unavailable for db-info, returning fallback summary:', error);
    return NextResponse.json({
      success: true,
      mode: 'in-memory',
      databaseName: 'in-memory-fallback',
      collections: ['bikes', 'enquiries', 'test_rides', 'sell_bike_requests', 'contact_enquiries'],
      counts: {
        bikes: 5,
        enquiries: 0,
        test_rides: 0,
        sell_bike_requests: 0,
        contact_enquiries: 0,
      },
    });
  }
}
