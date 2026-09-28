import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@torquemoto.in';
const ADMIN_PASSWORD = 'TorqueAdmin2026!';

console.log(`\n==============================================`);
console.log(`TORQUE TWO-WHEELERS - PHASE 1 VERIFICATION`);
console.log(`Testing target: ${BASE_URL}`);
console.log(`==============================================\n`);

async function run() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Public Pages
  for (const page of ['/', '/bikes', '/sell-your-bike', '/about', '/experience', '/contact', '/admin/login']) {
    await test(`GET ${page} returns HTTP 200`, async () => {
      const res = await fetch(`${BASE_URL}${page}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text.includes('Torque Two-Wheelers') && !text.includes('TORQUE') && !text.includes('torque')) {
        throw new Error('Branding missing or unexpected');
      }
    });
  }

  // 2. Bikes Inventory API
  let testBikeId = null;
  await test('GET /api/bikes returns certified bikes', async () => {
    const res = await fetch(`${BASE_URL}/api/bikes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.bikes) || json.bikes.length === 0) {
      throw new Error('No bikes returned');
    }
    testBikeId = json.bikes[0]._id;
    console.log(`         -> Found ${json.bikes.length} bikes in catalog (1st: ${json.bikes[0].title})`);
  });

  // 3. Bike Detail
  if (testBikeId) {
    await test(`GET /api/bikes/${testBikeId} returns bike details`, async () => {
      const res = await fetch(`${BASE_URL}/api/bikes/${testBikeId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.bike) throw new Error('Failed to retrieve bike');
      console.log(`         -> Detail loaded: ${json.bike.title} (${json.bike.engineCC}cc, ₹${json.bike.price})`);
    });
  }

  // 4. Customer Enquiry API
  await test('POST /api/enquiries creates customer enquiry', async () => {
    const payload = {
      customerName: 'Aarav Mehta',
      phone: '+91 9876543210',
      email: 'aarav.mehta@example.com',
      bikeId: testBikeId,
      message: 'Looking for prompt test ride and paperwork support.',
    };
    const res = await fetch(`${BASE_URL}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.enquiry) throw new Error('Enquiry creation failed');
  });

  // 5. Test Ride API
  await test('POST /api/test-rides creates test ride booking', async () => {
    const payload = {
      customerName: 'Rohan Deshmukh',
      phone: '+91 9820011223',
      email: 'rohan.d@example.com',
      bikeId: testBikeId || 'test_bike_id',
      preferredDate: '2026-10-05',
      preferredTime: '11:30 AM',
      drivingLicenseNumber: 'MH-02-2022-0098765',
      drivingLicenseVerified: true,
      helmetRequired: false,
      ridingExperience: 'Over 5 Years',
      message: 'Looking forward to testing throttle response.',
    };
    const res = await fetch(`${BASE_URL}/api/test-rides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.booking) throw new Error('Test ride booking failed');
  });

  // 6. Sell Bike API
  await test('POST /api/sell-bikes creates sell bike request', async () => {
    const payload = {
      ownerName: 'Kabir Singhania',
      phone: '+91 9833344556',
      email: 'kabir.s@example.com',
      bikeBrand: 'KTM',
      bikeModel: 'Duke 390',
      bikeYear: 2023,
      kilometers: 12000,
      bikeType: 'Naked / Roadster',
      engineCC: 373,
      expectedPrice: 240000,
      location: 'Bengaluru Indiranagar',
      message: 'Single owner, zero falls, showroom serviced throughout.',
    };
    const res = await fetch(`${BASE_URL}/api/sell-bikes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.request) throw new Error('Sell bike request creation failed');
  });

  // 7. Contact API
  await test('POST /api/contact logs studio inquiry', async () => {
    const payload = {
      name: 'Nisha Varma',
      phone: '+91 9811122334',
      email: 'nisha.v@example.com',
      topic: 'Schedule Studio Visit & Inspection',
      preferredDate: '2026-10-02',
      message: 'Interested in viewing the Classic 350 and Hunter 350 side by side.',
    };
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.enquiry) throw new Error('Contact enquiry creation failed');
  });

  // 8. Admin Authentication
  let adminCookie = '';
  await test('POST /api/admin/auth/login authenticates with Torque credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.admin) throw new Error('Admin login failed');
    const setCookie = res.headers.get('set-cookie');
    if (!setCookie || !setCookie.includes('torque_bike_admin_session')) {
      throw new Error(`Expected torque_bike_admin_session cookie, got: ${setCookie}`);
    }
    adminCookie = setCookie.split(';')[0];
    console.log(`         -> Admin authenticated: ${json.admin.email} (Cookie: torque_bike_admin_session)`);
  });

  // 9. Admin Dashboard
  await test('GET /api/admin/dashboard returns bike dashboard metrics', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: adminCookie },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error('Admin dashboard failed');
    console.log(`         -> Dashboard metrics: ${json.data.totalBikes} total bikes, ${json.data.newEnquiries} enquiries, ${json.data.pendingTestRides} test rides, ${json.data.newSellRequests} sell requests`);
  });

  console.log(`\n==============================================`);
  console.log(`PHASE 1 VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
