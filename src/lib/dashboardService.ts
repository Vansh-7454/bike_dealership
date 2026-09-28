import connectToDatabase from './mongodb';
import Car from '@/models/Car';
import Enquiry from '@/models/Enquiry';
import TestDriveBooking from '@/models/TestDriveBooking';
import SellRequest from '@/models/SellRequest';
import { seedCarsIfEmpty } from './carsService';

export interface DashboardStats {
  totalCars: number;
  availableCars: number;
  soldCars: number;
  newEnquiries: number;
  pendingTestDrives: number;
  newSellRequests: number;
  recentEnquiries: Array<{
    _id: string;
    customerName: string;
    phone: string;
    email: string;
    carTitle?: string;
    createdAt: string;
    status: string;
  }>;
  upcomingTestDrives: Array<{
    _id: string;
    customerName: string;
    phone: string;
    email: string;
    vehicleTitle: string;
    preferredDate: string;
    preferredTime: string;
    status: string;
  }>;
  recentSellRequests: Array<{
    _id: string;
    ownerName: string;
    phone: string;
    email: string;
    vehicleTitle: string;
    expectedPrice?: number | null;
    createdAt: string;
    status: string;
  }>;
}

interface RawEnquiryDoc {
  _id: unknown;
  customerName: string;
  phone: string;
  email: string;
  carSnapshot?: { title?: string } | null;
  createdAt?: Date;
  status: string;
}

interface RawTestDriveDoc {
  _id: unknown;
  customerName: string;
  phone: string;
  email: string;
  carSnapshot?: { title?: string } | null;
  preferredDate?: Date;
  preferredTime: string;
  status: string;
}

interface RawSellRequestDoc {
  _id: unknown;
  ownerName: string;
  phone: string;
  email: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  expectedPrice?: number | null;
  createdAt?: Date;
  status: string;
}

export async function getAdminDashboardData(): Promise<DashboardStats> {
  await connectToDatabase();
  await seedCarsIfEmpty();

  const [
    totalCars,
    availableCars,
    soldCars,
    newEnquiries,
    pendingTestDrives,
    newSellRequests,
    recentEnquiriesRaw,
    upcomingTestDrivesRaw,
    recentSellRequestsRaw,
  ] = await Promise.all([
    Car.countDocuments({ status: { $ne: 'Archived' } }),
    Car.countDocuments({ status: 'Available' }),
    Car.countDocuments({ status: 'Sold' }),
    Enquiry.countDocuments({ status: 'New' }),
    TestDriveBooking.countDocuments({ status: 'Pending' }),
    SellRequest.countDocuments({ status: 'New' }),
    Enquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
    TestDriveBooking.find().sort({ preferredDate: 1, createdAt: -1 }).limit(5).lean(),
    SellRequest.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const recentEnquiries = (recentEnquiriesRaw as unknown as RawEnquiryDoc[] || []).map((e) => ({
    _id: String(e._id),
    customerName: e.customerName,
    phone: e.phone,
    email: e.email,
    carTitle: e.carSnapshot?.title || 'General Showroom Inquiry',
    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
    status: e.status,
  }));

  const upcomingTestDrives = (upcomingTestDrivesRaw as unknown as RawTestDriveDoc[] || []).map((t) => ({
    _id: String(t._id),
    customerName: t.customerName,
    phone: t.phone,
    email: t.email,
    vehicleTitle: t.carSnapshot?.title || 'Selected Vehicle',
    preferredDate: t.preferredDate ? new Date(t.preferredDate).toISOString() : new Date().toISOString(),
    preferredTime: t.preferredTime,
    status: t.status,
  }));

  const recentSellRequests = (recentSellRequestsRaw as unknown as RawSellRequestDoc[] || []).map((s) => ({
    _id: String(s._id),
    ownerName: s.ownerName,
    phone: s.phone,
    email: s.email,
    vehicleTitle: `${s.carYear} ${s.carBrand} ${s.carModel}`,
    expectedPrice: s.expectedPrice,
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
    status: s.status,
  }));

  return {
    totalCars,
    availableCars,
    soldCars,
    newEnquiries,
    pendingTestDrives,
    newSellRequests,
    recentEnquiries,
    upcomingTestDrives,
    recentSellRequests,
  };
}

