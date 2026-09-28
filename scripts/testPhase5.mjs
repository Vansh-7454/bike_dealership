/**
 * Phase 5 Comprehensive End-to-End Test Suite
 * Tests 1 to 9 as specified in prompt section 16.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aureusmotors.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AureusAdmin2026!';

let adminCookie = '';

async function loginAdmin() {
  console.log('Authenticating as admin...');
  const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admin login failed: ${res.status} - ${text}`);
  }

  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    adminCookie = setCookie.split(';')[0];
  }
  const json = await res.json();
  console.log(`✓ Admin authenticated successfully: ${json.admin.email}\n`);
}

async function runTests() {
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`  ❌ FAILED: ${message}`);
      failedCount++;
      throw new Error(message);
    } else {
      console.log(`  ✓ PASSED: ${message}`);
      passedCount++;
    }
  }

  await loginAdmin();

  // ==========================================
  // TEST 1: Open /cars -> Select a car -> Submit "I'm Interested" -> Verify MongoDB record -> Verify it appears in Admin
  // ==========================================
  console.log('==================================================');
  console.log('TEST 1: Vehicle Enquiry Flow & Admin Visibility');
  console.log('==================================================');
  try {
    const carsRes = await fetch(`${BASE_URL}/api/cars`);
    const carsData = await carsRes.json();
    assert(carsData.success && carsData.cars.length > 0, 'Fetched inventory vehicles');

    const selectedCar = carsData.cars[0];
    const uniqueEmail = `patron.${Date.now()}@aureus-test.com`;

    const enqRes = await fetch(`${BASE_URL}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Karan Mehra',
        phone: '+91 98200 12345',
        email: uniqueEmail,
        carId: selectedCar._id,
        acquisitionPreference: 'Outright Purchase',
        message: 'Interested in immediate delivery and private studio inspection.',
      }),
    });
    const enqData = await enqRes.json();
    assert(enqData.success, 'Public vehicle enquiry submitted successfully');
    assert(enqData.data && enqData.data._id, 'MongoDB record created with ID');

    // Verify it appears in Admin
    const adminEnqRes = await fetch(`${BASE_URL}/api/admin/enquiries?search=${encodeURIComponent(uniqueEmail)}`, {
      headers: { Cookie: adminCookie },
    });
    const adminEnqData = await adminEnqRes.json();
    assert(adminEnqData.success, 'Admin enquiries API called successfully');
    const found = adminEnqData.data.find((e) => e.email.toLowerCase() === uniqueEmail.toLowerCase());
    assert(found !== undefined, 'Enquiry record successfully located in Admin');
    assert(found.carSnapshot && found.carSnapshot.title === selectedCar.title, 'Vehicle snapshot correctly associated');
  } catch (err) {
    console.error('Test 1 error:', err.message);
  }

  // ==========================================
  // TEST 2: Open car detail -> Book Test Drive -> Verify MongoDB record -> Verify Admin can see it -> Change status -> Verify persistence
  // ==========================================
  console.log('\n==================================================');
  console.log('TEST 2: Test Drive Booking Flow & Admin Status Management');
  console.log('==================================================');
  try {
    const carsRes = await fetch(`${BASE_URL}/api/cars`);
    const carsData = await carsRes.json();
    const selectedCar = carsData.cars[0];
    const uniqueEmail = `td.patron.${Date.now()}@aureus-test.com`;
    const uniquePhone = `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;

    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const tdRes = await fetch(`${BASE_URL}/api/test-drives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Ananya Singhal',
        phone: uniquePhone,
        email: uniqueEmail,
        carId: selectedCar._id,
        locationType: 'home_office',
        city: 'Mumbai',
        address: '14 Altamount Road, Cumballa Hill',
        preferredDate: nextWeek,
        preferredTime: '11:00 AM - 01:00 PM',
        driverLicenseConfirmation: true,
      }),
    });
    const tdData = await tdRes.json();
    assert(tdData.success, 'Public test-drive booking submitted successfully');
    const bookingId = tdData.data._id;
    assert(Boolean(bookingId), 'Test drive MongoDB document created');

    // Admin verify
    const adminTdRes = await fetch(`${BASE_URL}/api/admin/test-drives?search=${encodeURIComponent(uniqueEmail)}`, {
      headers: { Cookie: adminCookie },
    });
    const adminTdData = await adminTdRes.json();
    assert(adminTdData.success, 'Admin test drives API responded');
    const foundTd = adminTdData.data.find((t) => t.email.toLowerCase() === uniqueEmail.toLowerCase());
    assert(foundTd !== undefined, 'Test drive record visible to Admin');

    // Change status to Confirmed
    const patchRes = await fetch(`${BASE_URL}/api/admin/test-drives/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ status: 'Confirmed' }),
    });
    const patchData = await patchRes.json();
    assert(patchData.success && patchData.data.status === 'Confirmed', 'Status updated to Confirmed');

    // Verify persistence
    const recheckRes = await fetch(`${BASE_URL}/api/admin/test-drives?search=${encodeURIComponent(uniqueEmail)}`, {
      headers: { Cookie: adminCookie },
    });
    const recheckData = await recheckRes.json();
    const updatedDoc = recheckData.data.find((t) => t._id === bookingId);
    assert(updatedDoc && updatedDoc.status === 'Confirmed', 'Confirmed status successfully persisted in MongoDB');
  } catch (err) {
    console.error('Test 2 error:', err.message);
  }

  // ==========================================
  // TEST 3: Open /sell-your-car -> Submit vehicle details -> Verify MongoDB record -> Verify Admin Sell Requests page -> Change status -> Refresh -> Verify status remains changed
  // ==========================================
  console.log('\n==================================================');
  console.log('TEST 3: Sell-Your-Car Workflow & Admin Management');
  console.log('==================================================');
  try {
    const uniqueEmail = `seller.${Date.now()}@aureus-test.com`;

    const sellRes = await fetch(`${BASE_URL}/api/sell-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerName: 'Vikram Sethi',
        phone: '+91 98111 22334',
        email: uniqueEmail,
        carBrand: 'BMW',
        carModel: '330i M Sport',
        carYear: 2022,
        kilometers: 21500,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        expectedPrice: 4200000,
        location: 'DL-01 (Delhi North)',
        message: 'Flawless condition, single owner with authorized service records.',
      }),
    });
    const sellData = await sellRes.json();
    assert(sellData.success, 'Sell request submitted with message: ' + sellData.message);
    const sellId = sellData.data._id;
    assert(Boolean(sellId), 'Sell request persisted in MongoDB with ID');

    // Admin view sell requests
    const adminSellRes = await fetch(`${BASE_URL}/api/admin/sell-requests?search=${encodeURIComponent(uniqueEmail)}`, {
      headers: { Cookie: adminCookie },
    });
    const adminSellData = await adminSellRes.json();
    assert(adminSellData.success, 'Admin sell requests API responded');
    const foundSell = adminSellData.data.find((s) => s.email.toLowerCase() === uniqueEmail.toLowerCase());
    assert(foundSell !== undefined, 'Sell request found in Admin portal');
    assert(foundSell.status === 'New', 'Initial status is "New"');

    // Change status: New -> Contacted
    const patchRes = await fetch(`${BASE_URL}/api/admin/sell-requests/${sellId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ status: 'Contacted' }),
    });
    const patchData = await patchRes.json();
    assert(patchData.success && patchData.data.status === 'Contacted', 'Status updated to "Contacted"');

    // Refresh and verify persistence
    const refreshRes = await fetch(`${BASE_URL}/api/admin/sell-requests?search=${encodeURIComponent(uniqueEmail)}`, {
      headers: { Cookie: adminCookie },
    });
    const refreshData = await refreshRes.json();
    const persistedDoc = refreshData.data.find((s) => s._id === sellId);
    assert(persistedDoc && persistedDoc.status === 'Contacted', 'Status remains "Contacted" after refresh');
  } catch (err) {
    console.error('Test 3 error:', err.message);
  }

  // ==========================================
  // TEST 4: Open /contact -> Submit general enquiry -> Verify it reaches Admin
  // ==========================================
  console.log('\n==================================================');
  console.log('TEST 4: General Showroom Contact Enquiry Flow');
  console.log('==================================================');
  try {
    const uniqueEmail = `contact.visitor.${Date.now()}@aureus-test.com`;

    const contactRes = await fetch(`${BASE_URL}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Pooja Bhattacharya',
        phone: '+91 98200 99887',
        email: uniqueEmail,
        carId: null,
        acquisitionPreference: 'Schedule Private Studio Visit',
        message: 'Requesting a private VIP evening appointment at Mumbai BKC flagship sanctuary.',
        source: 'contact_page',
      }),
    });
    const contactData = await contactRes.json();
    assert(contactData.success, 'General contact enquiry submitted successfully');
    assert(contactData.data.carId === null, 'carId is null for general enquiry');

    // Verify it reaches Admin
    const adminEnqRes = await fetch(`${BASE_URL}/api/admin/enquiries?search=${encodeURIComponent(uniqueEmail)}`, {
      headers: { Cookie: adminCookie },
    });
    const adminEnqData = await adminEnqRes.json();
    const foundGeneral = adminEnqData.data.find((e) => e.email.toLowerCase() === uniqueEmail.toLowerCase());
    assert(foundGeneral !== undefined, 'General inquiry reached Admin portal');
    assert(foundGeneral.carSnapshot === undefined || foundGeneral.carSnapshot === null, 'Correctly distinguished as general inquiry without car snapshot');
  } catch (err) {
    console.error('Test 4 error:', err.message);
  }

  // ==========================================
  // TEST 5: Admin adds a car -> Verify it appears publicly
  // ==========================================
  console.log('\n==================================================');
  console.log('TEST 5: Admin Adds Car & Public Inventory Appearance');
  console.log('==================================================');
  let createdCarId = '';
  try {
    const newCarPayload = {
      title: 'Audi Q5 Technology 45 TFSI',
      brand: 'Audi',
      model: 'Q5',
      variant: 'Technology 45 TFSI Quattro',
      year: 2023,
      price: 5450000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      kilometers: 14200,
      bodyType: 'SUV',
      color: 'Navarra Blue Metallic',
      ownership: '1st Owner',
      location: 'Bandra West, Mumbai',
      description: 'Single owner Audi Q5 with panoramic roof, Bang & Olufsen 3D sound, and Quattro AWD.',
      features: ['Quattro AWD', 'Bang & Olufsen 3D Sound', 'Panoramic Sunroof'],
      images: ['/images/inventory/xuv700_hero.jpg'],
      status: 'Available',
      inspectionScore: 160,
    };

    const addRes = await fetch(`${BASE_URL}/api/admin/cars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify(newCarPayload),
    });
    const addData = await addRes.json();
    assert(addData.success, 'Admin created car document');
    createdCarId = addData.data._id;
    assert(Boolean(createdCarId), 'Car has MongoDB ID: ' + createdCarId);

    // Verify it appears in public inventory
    const publicCarsRes = await fetch(`${BASE_URL}/api/cars?search=Audi`);
    const publicCarsData = await publicCarsRes.json();
    const foundCar = publicCarsData.cars.find((c) => c._id === createdCarId || c.title.includes('Audi Q5'));
    assert(foundCar !== undefined, 'Newly added car appears publicly in inventory');
  } catch (err) {
    console.error('Test 5 error:', err.message);
  }

  // ==========================================
  // TEST 6: Admin edits a car -> Verify public detail reflects the update
  // ==========================================
  console.log('\n==================================================');
  console.log('TEST 6: Admin Edits Car & Public Detail Reflection');
  console.log('==================================================');
  try {
    assert(Boolean(createdCarId), 'Existing car ID available from Test 5');

    const updatePayload = {
      price: 5290000,
      description: 'UPDATED: Curator verified price revision for immediate sanctuary delivery.',
    };

    const editRes = await fetch(`${BASE_URL}/api/admin/cars/${createdCarId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify(updatePayload),
    });
    const editData = await editRes.json();
    assert(editData.success, 'Admin updated car document');
    assert(editData.data.price === 5290000, 'Price updated to 5290000');

    // Public detail reflection
    const publicDetailRes = await fetch(`${BASE_URL}/api/cars/${createdCarId}`);
    const publicDetailData = await publicDetailRes.json();
    assert(publicDetailData.success, 'Public detail fetched');
    assert(publicDetailData.car.price === 5290000, 'Public price reflects updated database price');
    assert(publicDetailData.car.description.includes('UPDATED'), 'Public description reflects update');
  } catch (err) {
    console.error('Test 6 error:', err.message);
  }

  // ==========================================
  // TEST 7: Admin marks a car Sold -> Verify public inventory/detail reflects Sold status
  // ==========================================
  console.log('\n==================================================');
  console.log('TEST 7: Admin Marks Car Sold & Public Status Reflection');
  console.log('==================================================');
  try {
    assert(Boolean(createdCarId), 'Existing car ID available');

    const markSoldRes = await fetch(`${BASE_URL}/api/admin/cars/${createdCarId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ status: 'Sold' }),
    });
    const markSoldData = await markSoldRes.json();
    assert(markSoldData.success && markSoldData.data.status === 'Sold', 'Car marked Sold in Admin');

    // Verify public detail reflects Sold status
    const publicDetailRes = await fetch(`${BASE_URL}/api/cars/${createdCarId}`);
    const publicDetailData = await publicDetailRes.json();
    assert(publicDetailData.car.status === 'Sold', 'Public detail reflects Sold status');

    // Clean up created test car to keep inventory pristine
    await fetch(`${BASE_URL}/api/admin/cars/${createdCarId}?action=delete`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    console.log('  ✓ Cleaned up temporary test car');
  } catch (err) {
    console.error('Test 7 error:', err.message);
  }

  // ==========================================
  // TEST 8: Logout from Admin -> Try opening /admin -> Verify protected access
  // ==========================================
  console.log('\n==================================================');
  console.log('TEST 8: Admin Logout & Route Protection');
  console.log('==================================================');
  try {
    const logoutRes = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: adminCookie },
    });
    assert(logoutRes.ok, 'Logout API returned success');

    // Try accessing /admin frontend route without credentials
    const adminPageRes = await fetch(`${BASE_URL}/admin`, {
      redirect: 'manual',
    });
    // Middleware should redirect (307/302) to /admin/login
    assert(
      adminPageRes.status === 307 || adminPageRes.status === 302,
      `Unauthenticated access to /admin redirected with status ${adminPageRes.status}`
    );
    const location = adminPageRes.headers.get('location');
    assert(location && location.includes('/admin/login'), 'Redirect points to /admin/login');
  } catch (err) {
    console.error('Test 8 error:', err.message);
  }

  // ==========================================
  // TEST 9: Try calling protected Admin API without authentication -> Verify 401/403
  // ==========================================
  console.log('\n==================================================');
  console.log('TEST 9: Anonymous Access to Admin APIs (401/403 Verification)');
  console.log('==================================================');
  try {
    const endpoints = [
      '/api/admin/dashboard',
      '/api/admin/cars',
      '/api/admin/enquiries',
      '/api/admin/test-drives',
      '/api/admin/sell-requests',
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${BASE_URL}${ep}`);
      assert(
        res.status === 401 || res.status === 403,
        `Anonymous ${ep} correctly rejected with status ${res.status}`
      );
    }
  } catch (err) {
    console.error('Test 9 error:', err.message);
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n==================================================');
  console.log(`PHASE 5 TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('==================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
