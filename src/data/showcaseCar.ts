import { ICar } from '@/types';

export const HERO_SHOWCASE_CAR: ICar = {
  id: 'aureus-cpo-xuv700',
  slug: '2024-mahindra-xuv700-ax7l-awd',
  title: '2024 Mahindra XUV700 AX7 L Luxury AWD',
  brand: 'Mahindra',
  model: 'XUV700',
  year: 2024,
  variant: 'AX7 L (Luxury Pack) 2.2L mHawk AWD Automatic',
  price: 2385000,
  originalMsrp: 2950000,
  mileageKm: 19400,
  fuelType: 'Diesel',
  transmission: 'Automatic',
  bodyType: 'SUV',
  ownersCount: 1,
  registrationState: 'MH-02 (Mumbai West)',
  registrationYear: 2024,
  exteriorColor: 'Dazzling Silver Metallic',
  interiorColor: 'White Perforated Leatherette',
  locationCity: 'Mumbai Flagship Studio (BKC)',
  status: 'available',
  isHeroShowcase: true,
  featuredImages: {
    hero: '/images/inventory/xuv700_hero.jpg',
    front: '/images/inventory/xuv700_hero.jpg',
    interior: '/images/inventory/xuv700_interior.jpg',
    side: '/images/360/frame_2.jpg',
    rear: '/images/360/frame_4.jpg',
  },
  gallery: [
    '/images/inventory/xuv700_hero.jpg',
    '/images/360/frame_2.jpg',
    '/images/360/frame_4.jpg',
    '/images/inventory/xuv700_interior.jpg'
  ],
  keyHighlights: [
    'Single Corporate Owner from New',
    'Aureus 160-Point Audit Certified (100% Score)',
    'Zero Accidental History & Original Paint Meter Verified',
    'Sony 3D 12-Speaker Audio & Level 2 ADAS Suite',
    'Pan-India White Glove Covered Carrier Delivery'
  ],
  specs: {
    powerHp: 185,
    torqueNm: 450,
    acceleration0to100: '8.8s',
    topSpeedKmH: 195,
    rangeKm: 850,
    seatingCapacity: 7,
    bootSpaceLiters: 450
  },
  inspectionSummary: {
    totalPointsInspected: 160,
    passedPoints: 160,
    inspectionDate: '22 September 2026',
    certificationBadge: 'Aureus Gold Certified'
  },
  createdAt: '2026-09-20T10:00:00Z',
  updatedAt: '2026-09-25T11:00:00Z'
};

export const INVENTORY_COLLECTION: ICar[] = [
  HERO_SHOWCASE_CAR,
  {
    id: 'aureus-cpo-creta',
    slug: '2023-hyundai-creta-sxo-turbo',
    title: '2023 Hyundai Creta SX(O) 1.5 Turbo DCT',
    brand: 'Hyundai',
    model: 'Creta',
    year: 2023,
    variant: 'SX(O) Knight Edition 1.5L Turbo Petrol',
    price: 1680000,
    originalMsrp: 2050000,
    mileageKm: 22400,
    fuelType: 'Petrol',
    transmission: 'Dual-Clutch',
    bodyType: 'SUV',
    ownersCount: 1,
    registrationState: 'MH-01 (Mumbai South)',
    registrationYear: 2023,
    exteriorColor: 'Titan Grey Metallic',
    interiorColor: 'Obsidian Black with Red Accents',
    locationCity: 'Mumbai Studio (BKC)',
    status: 'available',
    featuredImages: {
      hero: '/images/inventory/creta_front.jpg',
      front: '/images/inventory/creta_front.jpg',
      interior: '/images/inventory/xuv700_interior.jpg',
    },
    gallery: [
      '/images/inventory/creta_front.jpg',
      '/images/inventory/xuv700_interior.jpg'
    ],
    keyHighlights: [
      'Panoramic Sunroof & Bose 8-Speaker Audio',
      'Ventilated Front Seats with Electric Adjustment',
      'Full Authorized Hyundai Service Record',
      'Electronic Parking Brake with Auto Hold'
    ],
    specs: {
      powerHp: 160,
      torqueNm: 253,
      acceleration0to100: '8.9s',
      seatingCapacity: 5,
      bootSpaceLiters: 433
    },
    inspectionSummary: {
      totalPointsInspected: 160,
      passedPoints: 160,
      inspectionDate: '15 Sep 2026',
      certificationBadge: 'Aureus Gold Certified'
    }
  },
  {
    id: 'aureus-cpo-city',
    slug: '2022-honda-city-zx-cvt',
    title: '2022 Honda City ZX 1.5 i-VTEC CVT',
    brand: 'Honda',
    model: 'City',
    year: 2022,
    variant: 'ZX Top-Spec 1.5L i-VTEC Automatic',
    price: 1340000,
    originalMsrp: 1690000,
    mileageKm: 31200,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    ownersCount: 1,
    registrationState: 'KA-03 (Bengaluru East)',
    registrationYear: 2022,
    exteriorColor: 'Platinum White Pearl',
    interiorColor: 'Beige Leather with Wood Finish',
    locationCity: 'Bengaluru (Indiranagar)',
    status: 'available',
    featuredImages: {
      hero: '/images/inventory/city_sedan.jpg',
      front: '/images/inventory/city_sedan.jpg',
      interior: '/images/inventory/xuv700_interior.jpg',
    },
    gallery: [
      '/images/inventory/city_sedan.jpg',
      '/images/inventory/xuv700_interior.jpg'
    ],
    keyHighlights: [
      'Full LED Jewel-Eye Headlamps & Electric Sunroof',
      'Honda LaneWatch Blind Spot Camera',
      'Direct from First Corporate Owner',
      'Zero Insurance Claims / No Accidental History'
    ],
    specs: {
      powerHp: 121,
      torqueNm: 145,
      acceleration0to100: '10.2s',
      seatingCapacity: 5,
      bootSpaceLiters: 506
    },
    inspectionSummary: {
      totalPointsInspected: 160,
      passedPoints: 159,
      inspectionDate: '18 Sep 2026',
      certificationBadge: 'Aureus Gold Certified'
    }
  },
  {
    id: 'aureus-cpo-grandvitara',
    slug: '2023-maruti-grand-vitara-hybrid',
    title: '2023 Maruti Suzuki Grand Vitara Alpha+ Hybrid',
    brand: 'Maruti Suzuki',
    model: 'Grand Vitara',
    year: 2023,
    variant: 'Alpha+ Strong Hybrid e-CVT Dual Tone',
    price: 1820000,
    originalMsrp: 2280000,
    mileageKm: 26100,
    fuelType: 'Hybrid',
    transmission: 'Direct Drive',
    bodyType: 'SUV',
    ownersCount: 1,
    registrationState: 'DL-03 (Delhi Central)',
    registrationYear: 2023,
    exteriorColor: 'Arctic White & Black Dual-Tone',
    interiorColor: 'Bordeaux & Black Leatherette',
    locationCity: 'Delhi NCR (Aerocity Studio)',
    status: 'available',
    featuredImages: {
      hero: '/images/inventory/grand_vitara.jpg',
      front: '/images/inventory/grand_vitara.jpg',
      interior: '/images/inventory/xuv700_interior.jpg',
    },
    gallery: [
      '/images/inventory/grand_vitara.jpg',
      '/images/inventory/xuv700_interior.jpg'
    ],
    keyHighlights: [
      'Strong Intelligent Electric Hybrid (27.97 km/l ARAI)',
      'Panoramic Sunroof & 360-Degree Camera',
      'Head-Up Display & Wireless Smartphone Charger',
      'OEM Lithium-ion Battery Under Factory Warranty till 2031'
    ],
    specs: {
      powerHp: 116,
      torqueNm: 141,
      acceleration0to100: '11.5s',
      rangeKm: 1100,
      seatingCapacity: 5,
      bootSpaceLiters: 355
    },
    inspectionSummary: {
      totalPointsInspected: 160,
      passedPoints: 160,
      inspectionDate: '20 Sep 2026',
      certificationBadge: 'Aureus Gold Certified'
    }
  },
  {
    id: 'aureus-cpo-nexon',
    slug: '2024-tata-nexon-fearless-plus',
    title: '2024 Tata Nexon Fearless Plus S',
    brand: 'Tata',
    model: 'Nexon',
    year: 2024,
    variant: 'Fearless Plus S 1.2L Revotron Turbo',
    price: 1185000,
    originalMsrp: 1420000,
    mileageKm: 14800,
    fuelType: 'Petrol',
    transmission: 'Manual',
    bodyType: 'SUV',
    ownersCount: 1,
    registrationState: 'MH-12 (Pune Central)',
    registrationYear: 2024,
    exteriorColor: 'Daytona Grey with Black Roof',
    interiorColor: 'Grey & Black Techno Interior',
    locationCity: 'Mumbai Studio (BKC)',
    status: 'available',
    featuredImages: {
      hero: '/images/inventory/nexon_rear.jpg',
      front: '/images/inventory/nexon_rear.jpg',
      interior: '/images/inventory/xuv700_interior.jpg',
    },
    gallery: [
      '/images/inventory/nexon_rear.jpg',
      '/images/inventory/xuv700_interior.jpg'
    ],
    keyHighlights: [
      '5-Star Global NCAP Adult & Child Safety Rating',
      'Connected X-Factor LED Taillights with Welcome Animation',
      '10.25-inch High-Definition Floating Touchscreen',
      'Single IT Professional Owner / Under OEM Warranty'
    ],
    specs: {
      powerHp: 120,
      torqueNm: 170,
      acceleration0to100: '10.8s',
      seatingCapacity: 5,
      bootSpaceLiters: 382
    },
    inspectionSummary: {
      totalPointsInspected: 160,
      passedPoints: 158,
      inspectionDate: '19 Sep 2026',
      certificationBadge: 'Aureus Gold Certified'
    }
  },
  {
    id: 'aureus-cpo-seltos',
    slug: '2023-kia-seltos-gtx-plus-turbo',
    title: '2023 Kia Seltos GTX Plus 1.5 Turbo DCT',
    brand: 'Kia',
    model: 'Seltos',
    year: 2023,
    variant: 'GTX Plus 1.5L T-GDi Petrol 7-DCT',
    price: 1765000,
    originalMsrp: 2150000,
    mileageKm: 21500,
    fuelType: 'Petrol',
    transmission: 'Dual-Clutch',
    bodyType: 'SUV',
    ownersCount: 1,
    registrationState: 'TS-09 (Hyderabad Central)',
    registrationYear: 2023,
    exteriorColor: 'Imperial Blue',
    interiorColor: 'All-Black Sport Leatherette with Red Stitching',
    locationCity: 'Hyderabad (Jubilee Hills)',
    status: 'available',
    featuredImages: {
      hero: '/images/inventory/seltos_blue.jpg',
      front: '/images/inventory/seltos_blue.jpg',
      interior: '/images/inventory/xuv700_interior.jpg',
    },
    gallery: [
      '/images/inventory/seltos_blue.jpg',
      '/images/inventory/xuv700_interior.jpg'
    ],
    keyHighlights: [
      'Dual 10.25-inch Curved Panoramic Displays',
      'Level 2 ADAS (17 Autonomous Safety Features)',
      'Dual Zone Fully Automatic Climate Control',
      'Zero Non-Accidental Guarantee Verified by Aureus Master Technicians'
    ],
    specs: {
      powerHp: 160,
      torqueNm: 253,
      acceleration0to100: '8.9s',
      seatingCapacity: 5,
      bootSpaceLiters: 433
    },
    inspectionSummary: {
      totalPointsInspected: 160,
      passedPoints: 160,
      inspectionDate: '16 Sep 2026',
      certificationBadge: 'Aureus Gold Certified'
    }
  }
];

export const FEATURED_SPOTLIGHT_CAR = HERO_SHOWCASE_CAR;
