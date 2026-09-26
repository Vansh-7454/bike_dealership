import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Car from '@/models/Car';
import { DEMO_CARS } from '@/lib/seedData';

export async function POST() {
  try {
    await connectToDatabase();

    // Check count or replace
    await Car.deleteMany({});
    const inserted = await Car.insertMany(DEMO_CARS);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${inserted.length} demo vehicles into MongoDB.`,
      count: inserted.length,
    });
  } catch (error) {
    console.error('API /api/cars/seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed MongoDB',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Allow simple GET to check status or trigger seed
  return POST();
}
