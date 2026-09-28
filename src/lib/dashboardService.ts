import connectToDatabase from './mongodb';
import Bike from '@/models/Bike';
import Enquiry from '@/models/Enquiry';
import TestRide from '@/models/TestRide';
import SellBikeRequest from '@/models/SellBikeRequest';
import { seedInitialBikesIfEmpty } from './bikesService';

export interface DashboardMetrics {
  totalBikes: number;
  availableBikes: number;
  soldBikes: number;
  newEnquiries: number;
  pendingTestRides: number;
  newSellRequests: number;
  recentEnquiries: Array<{
    _id: string;
    customerName: string;
    phone: string;
    email: string;
    bikeTitle?: string;
    createdAt: string;
    status: string;
  }>;
  upcomingTestRides: Array<{
    _id: string;
    customerName: string;
    phone: string;
    email: string;
    bikeTitle: string;
    preferredDate: string;
    preferredTime: string;
    status: string;
  }>;
  recentSellRequests: Array<{
    _id: string;
    ownerName: string;
    phone: string;
    email: string;
    bikeTitle: string;
    expectedPrice?: number | null;
    createdAt: string;
    status: string;
  }>;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await connectToDatabase();
  await seedInitialBikesIfEmpty();

  const [
    totalBikes,
    availableBikes,
    soldBikes,
    newEnquiries,
    pendingTestRides,
    newSellRequests,
    recentEnquiriesRaw,
    upcomingTestRidesRaw,
    recentSellRequestsRaw,
  ] = await Promise.all([
    Bike.countDocuments({ status: { $ne: 'Archived' } }),
    Bike.countDocuments({ status: 'Available' }),
    Bike.countDocuments({ status: 'Sold' }),
    Enquiry.countDocuments({ status: 'New' }),
    TestRide.countDocuments({ status: 'Pending' }),
    SellBikeRequest.countDocuments({ status: 'New' }),
    Enquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
    TestRide.find().sort({ preferredDate: 1, createdAt: -1 }).limit(5).lean(),
    SellBikeRequest.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const recentEnquiries = recentEnquiriesRaw.map((e) => ({
    _id: String(e._id),
    customerName: e.customerName,
    phone: e.phone,
    email: e.email,
    bikeTitle: e.bikeSnapshot?.title,
    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
    status: e.status,
  }));

  const upcomingTestRides = upcomingTestRidesRaw.map((t) => ({
    _id: String(t._id),
    customerName: t.customerName,
    phone: t.phone,
    email: t.email,
    bikeTitle: t.bikeSnapshot?.title || 'Motorcycle Test Ride',
    preferredDate: t.preferredDate ? new Date(t.preferredDate).toISOString() : new Date().toISOString(),
    preferredTime: t.preferredTime,
    status: t.status,
  }));

  const recentSellRequests = recentSellRequestsRaw.map((s) => ({
    _id: String(s._id),
    ownerName: s.ownerName,
    phone: s.phone,
    email: s.email,
    bikeTitle: `${s.year || s.bikeYear || ''} ${s.brand || s.bikeBrand || ''} ${s.model || s.bikeModel || ''}`.trim(),
    expectedPrice: s.expectedPrice,
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
    status: s.status,
  }));

  return {
    totalBikes,
    availableBikes,
    soldBikes,
    newEnquiries,
    pendingTestRides,
    newSellRequests,
    recentEnquiries,
    upcomingTestRides,
    recentSellRequests,
  };
}

export const getAdminDashboardData = getDashboardMetrics;
