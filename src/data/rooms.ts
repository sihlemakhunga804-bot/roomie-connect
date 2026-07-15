import roomObservatory from "@/assets/room-observatory.jpg";
import roomBraamfontein from "@/assets/room-braamfontein.jpg";
import roomMusgrave from "@/assets/room-musgrave.jpg";

export type Room = {
  id: string;
  img: string;
  gallery: string[];
  title: string;
  province: string;
  city: string;
  suburb: string;
  price: number;
  type: "Private Room" | "Shared Room" | "Studio" | "Entire Flat";
  amenities: string[];
  match: number;
  tag: string;
  description: string;
  lease: {
    available: string;
    minStay: string;
    deposit: number;
    utilities: string;
    furnished: boolean;
  };
  landlord: {
    name: string;
    verified: boolean;
    responseRate: number;
    responseTime: string;
    memberSince: string;
    bio: string;
    initials: string;
  };
  compatibility: {
    lifestyle: number;
    schedule: number;
    cleanliness: number;
    social: number;
  };
};

const gallery = (main: string) => [main, roomObservatory, roomBraamfontein, roomMusgrave];

export const ROOMS: Room[] = [
  {
    id: "1",
    img: roomObservatory,
    gallery: gallery(roomObservatory),
    title: "Heritage Loft Room",
    province: "Western Cape",
    city: "Cape Town",
    suburb: "Observatory",
    price: 6500,
    type: "Private Room",
    amenities: ["Wi-Fi", "Furnished", "Pet Friendly"],
    match: 95,
    tag: "Pet Friendly",
    description:
      "A sun-drenched private room in a restored Victorian on a quiet Obs side-street. Two housemates who love slow Sundays, good coffee, and their rescue tabby.",
    lease: {
      available: "1 Aug 2026",
      minStay: "6 months",
      deposit: 6500,
      utilities: "Included (capped at 500 kWh)",
      furnished: true,
    },
    landlord: {
      name: "Thandi M.",
      verified: true,
      responseRate: 98,
      responseTime: "within 2 hours",
      memberSince: "2024",
      bio: "Cape Town-based creative renting out a room in the home I share with my partner. I care about good matches over quick ones.",
      initials: "TM",
    },
    compatibility: { lifestyle: 96, schedule: 92, cleanliness: 97, social: 94 },
  },
  {
    id: "2",
    img: roomBraamfontein,
    gallery: gallery(roomBraamfontein),
    title: "Artistic Inner-City Studio",
    province: "Gauteng",
    city: "Johannesburg",
    suburb: "Braamfontein",
    price: 4200,
    type: "Studio",
    amenities: ["Wi-Fi", "Security"],
    match: 92,
    tag: "Student Friendly",
    description:
      "Compact studio in a well-managed Braam block. Steps from Neighbourgoods Market and Wits — ideal for a student or young creative.",
    lease: {
      available: "15 Jul 2026",
      minStay: "12 months",
      deposit: 4200,
      utilities: "Prepaid electricity",
      furnished: false,
    },
    landlord: {
      name: "Sipho K.",
      verified: true,
      responseRate: 94,
      responseTime: "within 4 hours",
      memberSince: "2023",
      bio: "I manage a small portfolio of student-friendly units in inner-city Joburg. Fair terms, quick fixes.",
      initials: "SK",
    },
    compatibility: { lifestyle: 90, schedule: 95, cleanliness: 88, social: 93 },
  },
  {
    id: "3",
    img: roomMusgrave,
    gallery: gallery(roomMusgrave),
    title: "Garden Cottage Wing",
    province: "KwaZulu-Natal",
    city: "Durban",
    suburb: "Musgrave",
    price: 5800,
    type: "Private Room",
    amenities: ["Solar", "Parking", "Furnished"],
    match: 98,
    tag: "Verified Landlord",
    description:
      "Private wing of a garden cottage with its own entrance, off-grid solar, and a shaded stoep. Quiet, leafy Musgrave street.",
    lease: {
      available: "1 Sep 2026",
      minStay: "9 months",
      deposit: 5800,
      utilities: "Solar + borehole included",
      furnished: true,
    },
    landlord: {
      name: "Priya N.",
      verified: true,
      responseRate: 100,
      responseTime: "within 1 hour",
      memberSince: "2022",
      bio: "Durban homeowner. I live on the property and value calm, considerate tenants.",
      initials: "PN",
    },
    compatibility: { lifestyle: 98, schedule: 97, cleanliness: 99, social: 96 },
  },
  {
    id: "4",
    img: roomObservatory,
    gallery: gallery(roomObservatory),
    title: "Sunny Sandton Share",
    province: "Gauteng",
    city: "Sandton",
    suburb: "Rivonia",
    price: 7200,
    type: "Shared Room",
    amenities: ["Wi-Fi", "Pool", "Security", "Parking"],
    match: 88,
    tag: "Young Pro",
    description:
      "Shared room in a modern 3-bed with pool, secure parking, and fibre. Housemates work in finance and design — early risers, gym regulars.",
    lease: {
      available: "1 Aug 2026",
      minStay: "6 months",
      deposit: 7200,
      utilities: "Split evenly (~R900pm)",
      furnished: true,
    },
    landlord: {
      name: "Lebo D.",
      verified: true,
      responseRate: 91,
      responseTime: "within 6 hours",
      memberSince: "2023",
      bio: "Sandton-based investor. Property is managed by me directly.",
      initials: "LD",
    },
    compatibility: { lifestyle: 86, schedule: 90, cleanliness: 89, social: 87 },
  },
  {
    id: "5",
    img: roomBraamfontein,
    gallery: gallery(roomBraamfontein),
    title: "Stellenbosch Student Flat",
    province: "Western Cape",
    city: "Stellenbosch",
    suburb: "Dennesig",
    price: 3800,
    type: "Shared Room",
    amenities: ["Wi-Fi", "Furnished", "Washer"],
    match: 90,
    tag: "Student Friendly",
    description:
      "Walkable to campus. Shared with two Maties, both postgrads. Quiet study environment, weekly cleaner included.",
    lease: {
      available: "1 Feb 2027",
      minStay: "Academic year",
      deposit: 3800,
      utilities: "Included",
      furnished: true,
    },
    landlord: {
      name: "Anke V.",
      verified: true,
      responseRate: 96,
      responseTime: "within 3 hours",
      memberSince: "2021",
      bio: "Long-time Stellies landlord. NSFAS-friendly.",
      initials: "AV",
    },
    compatibility: { lifestyle: 89, schedule: 93, cleanliness: 92, social: 88 },
  },
  {
    id: "6",
    img: roomMusgrave,
    gallery: gallery(roomMusgrave),
    title: "Menlo Park Entire Flat",
    province: "Gauteng",
    city: "Pretoria",
    suburb: "Menlo Park",
    price: 9500,
    type: "Entire Flat",
    amenities: ["Wi-Fi", "Furnished", "Parking", "Security"],
    match: 85,
    tag: "Verified Landlord",
    description:
      "Entire 1-bed flat in a boutique block. Perfect for a couple or solo pro who wants their own space with amenities.",
    lease: {
      available: "1 Aug 2026",
      minStay: "12 months",
      deposit: 9500,
      utilities: "Prepaid",
      furnished: true,
    },
    landlord: {
      name: "Johan B.",
      verified: true,
      responseRate: 89,
      responseTime: "within 12 hours",
      memberSince: "2022",
      bio: "Pretoria property owner. Straight-forward lease, transparent terms.",
      initials: "JB",
    },
    compatibility: { lifestyle: 84, schedule: 88, cleanliness: 90, social: 78 },
  },
  {
    id: "7",
    img: roomObservatory,
    gallery: gallery(roomObservatory),
    title: "Bloem Garden Room",
    province: "Free State",
    city: "Bloemfontein",
    suburb: "Universitas",
    price: 3500,
    type: "Private Room",
    amenities: ["Wi-Fi", "Pet Friendly", "Parking"],
    match: 82,
    tag: "Student Friendly",
    description:
      "Ground-floor room with private garden access near UFS. Housemate is a vet student with a friendly Labrador.",
    lease: {
      available: "20 Jul 2026",
      minStay: "6 months",
      deposit: 3500,
      utilities: "Included",
      furnished: true,
    },
    landlord: {
      name: "Marius P.",
      verified: false,
      responseRate: 80,
      responseTime: "within 24 hours",
      memberSince: "2025",
      bio: "New to ROOMIE. Property owner in Bloem for 8 years.",
      initials: "MP",
    },
    compatibility: { lifestyle: 80, schedule: 85, cleanliness: 82, social: 80 },
  },
  {
    id: "8",
    img: roomMusgrave,
    gallery: gallery(roomMusgrave),
    title: "Umhlanga Beachside Studio",
    province: "KwaZulu-Natal",
    city: "Durban",
    suburb: "Umhlanga",
    price: 8200,
    type: "Studio",
    amenities: ["Wi-Fi", "Pool", "Security", "Furnished"],
    match: 93,
    tag: "Sea View",
    description:
      "Modern studio 4 minutes' walk from the promenade. Ocean glimpse, communal pool, secure access.",
    lease: {
      available: "1 Aug 2026",
      minStay: "6 months",
      deposit: 8200,
      utilities: "Levies included, electricity prepaid",
      furnished: true,
    },
    landlord: {
      name: "Zanele H.",
      verified: true,
      responseRate: 97,
      responseTime: "within 2 hours",
      memberSince: "2023",
      bio: "Umhlanga local. I self-manage all my units for a personal touch.",
      initials: "ZH",
    },
    compatibility: { lifestyle: 94, schedule: 91, cleanliness: 95, social: 92 },
  },
];

export const getRoom = (id: string) => ROOMS.find((r) => r.id === id);
