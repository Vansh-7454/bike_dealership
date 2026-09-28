// Phase 3 End-to-End Automated Verification Script
// Tests all 6 required flows and verifies database separation in MongoDB

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_CREDENTIALS = {
  email: 'admin@torquemoto.in',
  password: 'TorqueAdmin2026!',
};

let adminCookie = '';
let adminToken = '';

async function loginAdmin() {
  const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ADMIN_CREDENTIALS),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Admin login failed with status ${res.status}: ${errText}`);
  }

  const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
  if (setCookies && setCookies[0]) {
    adminCookie = setCookies[0].split(';')[0];
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Admin login rejected: ${data.error}`);
  }
  if (data.token) {
    adminToken = data.token;
  }
  console.log('✓ Admin authenticated successfully.');
}

function getAdminHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (adminCookie) headers['Cookie'] = adminCookie;
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
  return headers;
}

async function runTests() {
  console.log('========================================================');
  console.log('STARTING PHASE 3 END-TO-END WORKFLOW VERIFICATION');
  console.log('Target Database: used_bikes (Torque Two-Wheelers)');
  console.log('========================================================\n');

  await loginAdmin();

  // Initial DB check
  const dbInfoRes = await fetch(`${BASE_URL}/api/admin/db-info`, {
    headers: getAdminHeaders(),
  });
  if (!dbInfoRes.ok) {
    const errText = await dbInfoRes.text();
    throw new Error(`Failed to query db-info: status ${dbInfoRes.status} - ${errText}`);
  }
  const initialDbInfo = await dbInfoRes.json();
  console.log(`✓ Connected to active database: "${initialDbInfo.databaseName}"`);
  console.log(`✓ Existing collections: ${initialDbInfo.collections.join(', ')}`);
  console.log(`✓ Initial document counts:`, initialDbInfo.counts);

  if (initialDbInfo.databaseName !== 'used_bikes') {
    throw new Error(`Database separation violation! Expected "used_bikes", got "${initialDbInfo.databaseName}"`);
  }

  // Find an available bike for testing
  const bikesRes = await fetch(`${BASE_URL}/api/bikes`);
  if (!bikesRes.ok) throw new Error(`Failed to get bikes catalog: ${bikesRes.status}`);
  const bikesData = await bikesRes.json();
  const availableBikes = bikesData.bikes?.filter((b) => b.status === 'Available') || [];
  if (availableBikes.length === 0) {
    throw new Error('No available motorcycle found in used_bikes database for testing.');
  }
  const sampleBike = availableBikes[0];
  const bikeId = String(sampleBike._id);
  const bikeSlug = sampleBike.slug;
  console.log(`\nUsing Test Motorcycle: "${sampleBike.title}" (ID: ${bikeId}, Year: ${sampleBike.year}, Price: ₹${sampleBike.price})`);

  // -------------------------------------------------------------
  // TEST 1: Bike Enquiry ("I'm Interested")
  // -------------------------------------------------------------
  console.log('\n--- TEST 1: Bike Enquiry ("I\'m Interested") ---');
  const testEnquiryPayload = {
    customerName: 'Aditya Sen',
    phone: '9820011223',
    email: `aditya.sen.${Date.now()}@example.com`,
    bikeId: bikeId,
    message: 'Requesting verified 120-point mechanical inspection report and single-owner RC copy.',
  };

  const enquiryRes = await fetch(`${BASE_URL}/api/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testEnquiryPayload),
  });

  const enquiryData = await enquiryRes.json();
  if (!enquiryRes.ok || !enquiryData.success) {
    throw new Error(`Enquiry submission failed: ${JSON.stringify(enquiryData)}`);
  }
  console.log('✓ Public POST /api/enquiries succeeded with HTTP 201.');
  console.log(`✓ Customer success message: "${enquiryData.message}"`);

  // Verify Admin sees it
  const adminEnqRes = await fetch(`${BASE_URL}/api/admin/enquiries?search=${encodeURIComponent(testEnquiryPayload.email)}`, {
    headers: getAdminHeaders(),
  });
  const adminEnqData = await adminEnqRes.json();
  if (!adminEnqRes.ok || !adminEnqData.success || adminEnqData.data.length === 0) {
    throw new Error('Admin enquiry query failed or did not return the submitted enquiry.');
  }
  const adminEnq = adminEnqData.data[0];
  if (String(adminEnq.bikeId) !== bikeId) {
    throw new Error(`Enquiry bikeId mismatch! Expected: ${bikeId}, Found: ${adminEnq.bikeId}`);
  }
  if (!adminEnq.bikeSnapshot || adminEnq.bikeSnapshot.title !== sampleBike.title) {
    throw new Error(`Enquiry bikeSnapshot mismatch! Snapshot: ${JSON.stringify(adminEnq.bikeSnapshot)}`);
  }
  console.log(`✓ Admin verification: /admin/enquiries retrieved enquiry with status "${adminEnq.status}" and snapshot "${adminEnq.bikeSnapshot.title}".`);

  // -------------------------------------------------------------
  // TEST 2: Book a Test Ride
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Book a Test Ride ---');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const preferredDateStr = tomorrow.toISOString().split('T')[0];

  const testRidePayload = {
    bikeId: bikeId,
    customerName: 'Rohit Kulkarni',
    phone: '9833445566',
    email: `rohit.ride.${Date.now()}@example.com`,
    preferredDate: preferredDateStr,
    preferredTime: 'Morning (10:00 AM - 1:00 PM)',
    message: 'Will bring personal full-face helmet.',
  };

  const rideRes = await fetch(`${BASE_URL}/api/test-rides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testRidePayload),
  });

  const rideData = await rideRes.json();
  if (!rideRes.ok || !rideData.success) {
    throw new Error(`Test ride booking failed: ${JSON.stringify(rideData)}`);
  }
  console.log('✓ Public POST /api/test-rides succeeded with HTTP 201.');
  console.log(`✓ Customer success message: "${rideData.message}"`);

  // Verify Admin sees it
  const adminRideRes = await fetch(`${BASE_URL}/api/admin/test-rides?search=${encodeURIComponent(testRidePayload.email)}`, {
    headers: getAdminHeaders(),
  });
  const adminRideData = await adminRideRes.json();
  if (!adminRideRes.ok || !adminRideData.bookings || adminRideData.bookings.length === 0) {
    throw new Error('Admin test-rides query failed or did not return the booking.');
  }
  const adminBooking = adminRideData.bookings[0];
  if (String(adminBooking.bikeId) !== bikeId) {
    throw new Error(`TestRide bikeId mismatch! Expected: ${bikeId}, Found: ${adminBooking.bikeId}`);
  }
  if (adminBooking.status !== 'Pending') {
    throw new Error(`TestRide initial status must be 'Pending', found: ${adminBooking.status}`);
  }
  console.log(`✓ Admin verification: /admin/test-rides retrieved booking with status "${adminBooking.status}".`);

  // -------------------------------------------------------------
  // TEST 3: Admin changes Test Ride: Pending → Confirmed (Persistence Check)
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Admin Status Transition (Pending → Confirmed) ---');
  const patchRideRes = await fetch(`${BASE_URL}/api/admin/test-rides`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({
      id: String(adminBooking._id),
      status: 'Confirmed',
    }),
  });

  const patchData = await patchRideRes.json();
  if (!patchRideRes.ok || !patchData.success) {
    throw new Error(`Failed to update test ride status: ${JSON.stringify(patchData)}`);
  }

  // Refresh Admin query and verify persistence
  const verifyRefreshRes = await fetch(`${BASE_URL}/api/admin/test-rides?search=${encodeURIComponent(testRidePayload.email)}`, {
    headers: getAdminHeaders(),
  });
  const verifyRefreshData = await verifyRefreshRes.json();
  const updatedBooking = verifyRefreshData.bookings?.find((b) => b._id === String(adminBooking._id));
  if (!updatedBooking || updatedBooking.status !== 'Confirmed') {
    throw new Error(`Status did not persist as Confirmed! Found: ${updatedBooking?.status}`);
  }
  console.log('✓ Admin updated status from Pending → Confirmed, and status persistently updated in database.');

  // -------------------------------------------------------------
  // TEST 4: Sell Your Bike Workflow
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Sell Your Bike Workflow ---');
  const sellPayload = {
    ownerName: 'Vikram Joshi',
    phone: '9845112233',
    email: `vikram.sell.${Date.now()}@example.com`,
    location: 'Indiranagar, Bengaluru',
    brand: 'Royal Enfield',
    model: 'Himalayan 450',
    variant: 'Kamet White Tubeless',
    year: 2024,
    kilometers: 4200,
    fuelType: 'Petrol',
    transmission: 'Manual',
    engineCC: 452,
    expectedPrice: 285000,
    message: 'Single owner, pristine showroom serviced with Royal Enfield warranty.',
  };

  const sellRes = await fetch(`${BASE_URL}/api/sell-bikes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sellPayload),
  });

  const sellData = await sellRes.json();
  if (!sellRes.ok || !sellData.success) {
    throw new Error(`Sell bike request failed: ${JSON.stringify(sellData)}`);
  }
  console.log('✓ Public POST /api/sell-bikes succeeded with HTTP 201.');
  console.log(`✓ Customer success message: "${sellData.message}"`);

  // Verify Admin sees it
  const adminSellRes = await fetch(`${BASE_URL}/api/admin/sell-bikes?search=${encodeURIComponent(sellPayload.email)}`, {
    headers: getAdminHeaders(),
  });
  const adminSellData = await adminSellRes.json();
  if (!adminSellRes.ok || !adminSellData.requests || adminSellData.requests.length === 0) {
    throw new Error('Admin sell-bikes query failed or did not return the request.');
  }
  const adminSellReq = adminSellData.requests[0];
  if (adminSellReq.brand !== sellPayload.brand || adminSellReq.model !== sellPayload.model || adminSellReq.year !== sellPayload.year) {
    throw new Error(`Sell bike record fields mismatch: ${JSON.stringify(adminSellReq)}`);
  }
  console.log(`✓ Admin verification: /admin/sell-bikes retrieved request with owner "${adminSellReq.ownerName}" and status "${adminSellReq.status}".`);

  // -------------------------------------------------------------
  // TEST 5: Contact / General Enquiry
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Contact / General Enquiry Workflow ---');
  const contactPayload = {
    name: 'Ananya Deshmukh',
    phone: '9876501234',
    email: `ananya.contact.${Date.now()}@example.com`,
    topic: 'Showroom Studio Inspection & Sourcing',
    message: 'Inquiring about certified Kawasaki Ninja 400 or KTM Duke 390 availability in Bengaluru studio.',
  };

  const contactRes = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactPayload),
  });

  const contactData = await contactRes.json();
  if (!contactRes.ok || !contactData.success) {
    throw new Error(`Contact inquiry submission failed: ${JSON.stringify(contactData)}`);
  }
  console.log('✓ Public POST /api/contact succeeded with HTTP 201.');

  // Verify Admin can see it
  const adminContactRes = await fetch(`${BASE_URL}/api/admin/contacts?search=${encodeURIComponent(contactPayload.email)}`, {
    headers: getAdminHeaders(),
  });
  const adminContactData = await adminContactRes.json();
  if (!adminContactRes.ok || !adminContactData.contacts || adminContactData.contacts.length === 0) {
    throw new Error('Admin contacts query failed or did not return the contact submission.');
  }
  console.log(`✓ Admin verification: /admin/contacts retrieved contact submission from "${adminContactData.contacts[0].name}".`);

  // -------------------------------------------------------------
  // TEST 6: Sold / Archived Bike Behavior
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Sold / Archived Bike Behavior ---');
  // Mark our test bike as "Sold"
  const markSoldRes = await fetch(`${BASE_URL}/api/admin/bikes/${bikeId}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({
      status: 'Sold',
    }),
  });
  const markSoldData = await markSoldRes.json();
  if (!markSoldRes.ok || !markSoldData.success) {
    throw new Error(`Failed to mark bike as Sold in Admin: ${JSON.stringify(markSoldData)}`);
  }
  console.log('✓ Admin successfully marked bike as "Sold".');

  // Verify public detail page renders with "SOLD"
  const detailPageRes = await fetch(`${BASE_URL}/bikes/${bikeSlug || bikeId}`);
  const detailHtml = await detailPageRes.text();
  if (!detailHtml.includes('SOLD')) {
    throw new Error('Public bike detail page does not contain "SOLD" status banner!');
  }
  console.log('✓ Public detail page /bikes/[id] displays "SOLD" status clearly.');

  // Verify that submitting a Test Ride for a Sold bike is rejected!
  const soldTestRideRes = await fetch(`${BASE_URL}/api/test-rides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bikeId: bikeId,
      customerName: 'Late Rider',
      phone: '9988776655',
      email: `late.rider.${Date.now()}@example.com`,
      preferredDate: preferredDateStr,
      preferredTime: 'Morning (10:00 AM - 1:00 PM)',
    }),
  });
  const soldTestRideData = await soldTestRideRes.json();
  if (soldTestRideRes.ok && soldTestRideData.success) {
    throw new Error('Test ride submission was allowed for a Sold bike! It should be rejected.');
  }
  console.log(`✓ Validation verification: Test ride for Sold bike was correctly rejected: "${soldTestRideData.error}"`);

  // Restore bike status to Available for clean inventory
  const restoreRes = await fetch(`${BASE_URL}/api/admin/bikes/${bikeId}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({
      status: 'Available',
    }),
  });
  const restoreData = await restoreRes.json();
  if (!restoreRes.ok || !restoreData.success) {
    throw new Error(`Failed to restore bike status: ${JSON.stringify(restoreData)}`);
  }
  console.log('✓ Test bike status restored to "Available".');

  // -------------------------------------------------------------
  // FINAL DATABASE SEPARATION CHECK
  // -------------------------------------------------------------
  console.log('\n--- DATABASE SEPARATION CHECK ---');
  const finalDbInfoRes = await fetch(`${BASE_URL}/api/admin/db-info`, {
    headers: getAdminHeaders(),
  });
  const finalDbInfo = await finalDbInfoRes.json();

  console.log(`Operational Database: ${finalDbInfo.databaseName}`);
  console.log(`Active Collections: ${finalDbInfo.collections.join(', ')}`);
  console.log(`Final Document counts:`, finalDbInfo.counts);

  const hasBikes = finalDbInfo.collections.includes('bikes');
  const hasEnquiries = finalDbInfo.collections.includes('enquiries');
  const hasTestRides = finalDbInfo.collections.includes('test_rides');
  const hasSellBikes = finalDbInfo.collections.includes('sell_bike_requests');
  const hasContacts = finalDbInfo.collections.includes('contact_enquiries');

  if (!hasBikes || !hasEnquiries || !hasTestRides || !hasSellBikes || !hasContacts) {
    throw new Error('Missing expected bike collections in used_bikes database!');
  }

  if (finalDbInfo.databaseName !== 'used_bikes') {
    throw new Error(`Database separation violation! Database name is "${finalDbInfo.databaseName}", expected "used_bikes".`);
  }

  console.log('✓ Verified: All 5 independent bike collections exist strictly inside "used_bikes".');

  console.log('\n========================================================');
  console.log('ALL PHASE 3 WORKFLOW TESTS PASSED SUCCESSFULLY! (6/6)');
  console.log('========================================================');
}

runTests().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
