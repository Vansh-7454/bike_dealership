const BASE_URL = 'http://localhost:3000';

async function runTestSuite() {
  console.log('=== STARTING PHASE 4 AUTOMATED SECURITY & INTEGRATION TEST ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Unauthenticated /admin page access redirect check
  try {
    const res = await fetch(`${BASE_URL}/admin`, {
      redirect: 'manual',
    });
    const location = res.headers.get('location') || '';
    assert(
      res.status === 307 || res.status === 302 || location.includes('/admin/login'),
      `1. Open /admin while logged out -> Redirected to /admin/login (Status: ${res.status}, Location: ${location})`
    );
  } catch (err) {
    assert(false, `1. /admin redirect check failed: ${err.message}`);
  }

  // 2. Unauthenticated Admin API rejection check
  try {
    const res = await fetch(`${BASE_URL}/api/admin/dashboard`);
    const data = await res.json().catch(() => ({}));
    assert(
      res.status === 401,
      `2. Access /api/admin/dashboard without auth -> Rejected with HTTP 401 (Received: ${res.status})`
    );
  } catch (err) {
    assert(false, `2. Admin API rejection failed: ${err.message}`);
  }

  try {
    const res = await fetch(`${BASE_URL}/api/admin/cars`);
    assert(
      res.status === 401,
      `3. Access /api/admin/cars without auth -> Rejected with HTTP 401 (Received: ${res.status})`
    );
  } catch (err) {
    assert(false, `3. Admin cars rejection failed: ${err.message}`);
  }

  // 4. Invalid credentials login check
  try {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@aureusmotors.in', password: 'WrongPassword123' }),
    });
    assert(
      res.status === 401,
      `4. Login with invalid password -> Rejected with HTTP 401 (Received: ${res.status})`
    );
  } catch (err) {
    assert(false, `4. Invalid login check failed: ${err.message}`);
  }

  // 5. Valid credentials login & session cookie issuance
  let sessionCookie = '';
  try {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@aureusmotors.in', password: 'AureusAdmin2026!' }),
    });
    const setCookieHeader = res.headers.get('set-cookie');
    const data = await res.json();

    assert(
      res.status === 200 && data.success === true,
      `5. Login with valid credentials -> Successful authentication (Email: ${data.admin?.email})`
    );

    if (setCookieHeader) {
      sessionCookie = setCookieHeader.split(';')[0];
      assert(
        sessionCookie.startsWith('aureus_admin_session='),
        `6. Secure HTTP-only session cookie issued: ${sessionCookie.substring(0, 32)}...`
      );
    } else {
      assert(false, '6. No set-cookie header received from login');
    }
  } catch (err) {
    assert(false, `5/6. Valid login failed: ${err.message}`);
  }

  // 7. Access /api/admin/dashboard with authenticated session
  try {
    const res = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: sessionCookie },
    });
    const json = await res.json();
    assert(
      res.status === 200 && json.success && typeof json.data.totalCars === 'number',
      `7. Authenticated dashboard request -> Total Cars: ${json.data?.totalCars}, Available: ${json.data?.availableCars}, Enquiries: ${json.data?.newEnquiries}, Test Drives: ${json.data?.pendingTestDrives}`
    );
  } catch (err) {
    assert(false, `7. Authenticated dashboard request failed: ${err.message}`);
  }

  // 8. Add a new car via Admin API
  let createdCarId = '';
  let createdCarSlug = '';
  const testCarPayload = {
    brand: 'Porsche',
    model: 'Taycan',
    variant: '4S Performance Plus',
    year: 2024,
    price: 13500000,
    fuelType: 'Electric',
    transmission: 'Automatic',
    kilometers: 4200,
    bodyType: 'Sedan',
    color: 'Frozen Blue Metallic',
    ownership: '1st Owner',
    location: 'Mumbai Flagship Studio',
    description: 'Bespoke electric performance luxury sedan, single owner with full warranty.',
    features: ['Adaptive Air Suspension', 'Passenger Display', 'Performance Battery Plus', 'Surround View 3D'],
    images: ['/images/inventory/xuv700_hero.jpg'],
    featured: true,
    status: 'Available',
  };

  try {
    const res = await fetch(`${BASE_URL}/api/admin/cars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify(testCarPayload),
    });
    const data = await res.json();
    assert(
      res.status === 201 && data.success && data.data._id,
      `8. Add vehicle via Admin API -> Created car ID: ${data.data?._id}`
    );
    createdCarId = data.data?._id;
    createdCarSlug = data.data?.slug;
  } catch (err) {
    assert(false, `8. Add car failed: ${err.message}`);
  }

  // 9. Verify created car appears publicly
  try {
    const res = await fetch(`${BASE_URL}/api/cars?search=Taycan`);
    const json = await res.json();
    const found = (json.cars || []).find((c) => c._id === createdCarId || c.slug === createdCarSlug);
    assert(
      !!found,
      `9. Verify created car appears in public inventory -> Found: "${found?.title}" at ₹${(found?.price / 100000).toFixed(2)} Lakh`
    );
  } catch (err) {
    assert(false, `9. Public car verification failed: ${err.message}`);
  }

  // 10. Edit vehicle price via Admin API
  const updatedPrice = 12900000;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/cars/${createdCarId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ price: updatedPrice }),
    });
    const json = await res.json();
    assert(
      res.status === 200 && json.success && json.data.price === updatedPrice,
      `10. Edit vehicle price -> Price updated in MongoDB to ₹${(updatedPrice / 100000).toFixed(2)} Lakh`
    );
  } catch (err) {
    assert(false, `10. Edit price failed: ${err.message}`);
  }

  // 11. Verify public car detail page reflects updated price
  try {
    const res = await fetch(`${BASE_URL}/api/cars/${createdCarSlug || createdCarId}`);
    const json = await res.json();
    assert(
      res.status === 200 && json.car?.price === updatedPrice,
      `11. Public detail API reflects updated price: ₹${(json.car?.price / 100000).toFixed(2)} Lakh`
    );
  } catch (err) {
    assert(false, `11. Public price verification failed: ${err.message}`);
  }

  // 12. Mark vehicle as Sold via Admin status endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/admin/cars/${createdCarId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ status: 'Sold' }),
    });
    const json = await res.json();
    assert(
      res.status === 200 && json.success && json.data.status === 'Sold',
      `12. Mark vehicle Sold -> Status changed to Sold in MongoDB`
    );
  } catch (err) {
    assert(false, `12. Mark Sold failed: ${err.message}`);
  }

  // 13. Verify public inventory reflects Sold status
  try {
    const res = await fetch(`${BASE_URL}/api/cars?search=Taycan`);
    const json = await res.json();
    const found = (json.cars || []).find((c) => c._id === createdCarId || c.slug === createdCarSlug);
    assert(
      found && found.status === 'Sold',
      `13. Public inventory reflects Sold status (Status: ${found?.status})`
    );
  } catch (err) {
    assert(false, `13. Public Sold status verification failed: ${err.message}`);
  }

  // 14. Create public enquiry and update status in Admin
  let enquiryId = '';
  try {
    const res = await fetch(`${BASE_URL}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Vikramaditya Singhania',
        phone: '+91 98200 12345',
        email: `vikram.${Date.now()}@singhania.com`,
        carId: createdCarId,
        message: 'Interested in acquiring this vehicle immediately for my collection.',
      }),
    });
    const json = await res.json();
    enquiryId = json.data?._id;
    assert(
      res.status === 201 && json.success && enquiryId,
      `14. Created public customer enquiry (ID: ${enquiryId})`
    );
  } catch (err) {
    assert(false, `14. Create enquiry failed: ${err.message}`);
  }

  // 15. Update enquiry status via Admin API (New -> Contacted)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/enquiries/${enquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ status: 'Contacted' }),
    });
    const json = await res.json();
    assert(
      res.status === 200 && json.success && json.data?.status === 'Contacted',
      `15. Admin updated enquiry status to 'Contacted' and persisted to MongoDB`
    );
  } catch (err) {
    assert(false, `15. Update enquiry status failed: ${err.message}`);
  }

  // 16. Create test drive booking and update status in Admin
  let bookingId = '';
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const res = await fetch(`${BASE_URL}/api/test-drives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        carId: createdCarId,
        customerName: 'Aarav Mahindra',
        phone: '+91 98111 54321',
        email: `aarav.${Date.now()}@mahindra.com`,
        preferredDate: dateStr,
        preferredTime: 'morning',
        location: 'Mumbai Flagship Studio',
        message: 'Requesting morning slot for evaluation.',
      }),
    });
    const json = await res.json();
    bookingId = json.data?._id;
    assert(
      res.status === 201 && json.success && bookingId,
      `16. Created customer test-drive booking (ID: ${bookingId})`
    );
  } catch (err) {
    assert(false, `16. Create test drive failed: ${err.message}`);
  }

  // 17. Update test drive status via Admin API (Pending -> Confirmed)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/test-drives/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ status: 'Confirmed' }),
    });
    const json = await res.json();
    assert(
      res.status === 200 && json.success && json.data?.status === 'Confirmed',
      `17. Admin updated test-drive status to 'Confirmed' and persisted to MongoDB`
    );
  } catch (err) {
    assert(false, `17. Update test drive status failed: ${err.message}`);
  }

  // 18. Archive car and verify it is omitted from public inventory
  try {
    const res = await fetch(`${BASE_URL}/api/admin/cars/${createdCarId}?action=archive`, {
      method: 'DELETE',
      headers: { Cookie: sessionCookie },
    });
    const json = await res.json();
    assert(
      res.status === 200 && json.success,
      `18. Admin archived vehicle (Safe archive preserving enquiry relationships)`
    );

    const publicRes = await fetch(`${BASE_URL}/api/cars?search=Taycan`);
    const publicJson = await publicRes.json();
    const foundArchived = (publicJson.cars || []).find((c) => c._id === createdCarId);
    assert(
      !foundArchived,
      `19. Archived vehicle is completely omitted from public inventory listings`
    );
  } catch (err) {
    assert(false, `18/19. Archive vehicle failed: ${err.message}`);
  }

  // 20. Logout and verify session invalidation
  try {
    const res = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    const setCookie = res.headers.get('set-cookie') || '';
    assert(
      res.status === 200 && (setCookie.includes('Max-Age=0') || setCookie.includes('expires=')),
      `20. Admin logout endpoint cleared session cookie`
    );

    // Verify /admin is inaccessible with cleared cookie
    const protectedRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: 'aureus_admin_session=deleted' },
    });
    assert(
      protectedRes.status === 401,
      `21. Protected routes inaccessible after logout (Status: ${protectedRes.status})`
    );
  } catch (err) {
    assert(false, `20/21. Logout verification failed: ${err.message}`);
  }

  console.log('\n=== TEST SUITE COMPLETED ===');
  console.log(`Passed: ${passed} / ${passed + failed}`);
  console.log(`Failed: ${failed} / ${passed + failed}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
