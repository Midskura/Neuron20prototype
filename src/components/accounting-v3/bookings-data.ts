// Mock booking data for the BookingPicker
export interface Booking {
  id: string;
  bookingNo: string;
  companyId: string;
  companyCode: string;
  client: string;
  routeFrom: string;
  routeTo: string;
  date: Date;
  eta: Date | null;
  status: "For delivery" | "In transit" | "Delivered" | "Closed";
  amount: number | null;
  linkedEntriesCount: number;
}

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "1",
    bookingNo: "ND-2025-003",
    companyId: "cce",
    companyCode: "CCE",
    client: "Puregold",
    routeFrom: "Taguig",
    routeTo: "Cavite",
    date: new Date("2025-10-20"),
    eta: new Date("2025-10-21"),
    status: "Delivered",
    amount: 45000,
    linkedEntriesCount: 2,
  },
  {
    id: "2",
    bookingNo: "ND-2025-008",
    companyId: "cce",
    companyCode: "CCE",
    client: "SM Supermalls",
    routeFrom: "Manila",
    routeTo: "Cebu",
    date: new Date("2025-10-24"),
    eta: new Date("2025-10-26"),
    status: "In transit",
    amount: 78000,
    linkedEntriesCount: 0,
  },
  {
    id: "3",
    bookingNo: "ND-2025-012",
    companyId: "cce",
    companyCode: "CCE",
    client: "Robinson's",
    routeFrom: "Quezon City",
    routeTo: "Davao",
    date: new Date("2025-10-25"),
    eta: new Date("2025-10-27"),
    status: "For delivery",
    amount: 62000,
    linkedEntriesCount: 1,
  },
  {
    id: "4",
    bookingNo: "ND-2025-015",
    companyId: "cce",
    companyCode: "CCE",
    client: "Jollibee Foods Corp",
    routeFrom: "Pasig",
    routeTo: "Baguio",
    date: new Date("2025-10-26"),
    eta: new Date("2025-10-27"),
    status: "Delivered",
    amount: 38500,
    linkedEntriesCount: 3,
  },
  {
    id: "5",
    bookingNo: "ND-2025-019",
    companyId: "cce",
    companyCode: "CCE",
    client: "Ayala Land",
    routeFrom: "Makati",
    routeTo: "Iloilo",
    date: new Date("2025-10-23"),
    eta: null,
    status: "Closed",
    amount: null,
    linkedEntriesCount: 0,
  },
  {
    id: "6",
    bookingNo: "ND-2025-021",
    companyId: "nje",
    companyCode: "NJE",
    client: "Mercury Drug",
    routeFrom: "Valenzuela",
    routeTo: "Batangas",
    date: new Date("2025-10-25"),
    eta: new Date("2025-10-26"),
    status: "For delivery",
    amount: 28000,
    linkedEntriesCount: 0,
  },
  {
    id: "7",
    bookingNo: "ND-2025-024",
    companyId: "cce",
    companyCode: "CCE",
    client: "Nestle Philippines",
    routeFrom: "Laguna",
    routeTo: "Palawan",
    date: new Date("2025-10-22"),
    eta: new Date("2025-10-24"),
    status: "Delivered",
    amount: 95000,
    linkedEntriesCount: 1,
  },
  {
    id: "8",
    bookingNo: "ND-2025-027",
    companyId: "cce",
    companyCode: "CCE",
    client: "San Miguel Corp",
    routeFrom: "Bulacan",
    routeTo: "Pampanga",
    date: new Date("2025-10-26"),
    eta: new Date("2025-10-26"),
    status: "In transit",
    amount: 42000,
    linkedEntriesCount: 0,
  },
  {
    id: "9",
    bookingNo: "ND-2025-030",
    companyId: "cce",
    companyCode: "CCE",
    client: "Unilever",
    routeFrom: "Taguig",
    routeTo: "Rizal",
    date: new Date("2025-10-20"),
    eta: new Date("2025-10-21"),
    status: "Closed",
    amount: 31500,
    linkedEntriesCount: 2,
  },
  {
    id: "10",
    bookingNo: "ND-2025-033",
    companyId: "cce",
    companyCode: "CCE",
    client: "Metro Gaisano",
    routeFrom: "Manila",
    routeTo: "Cagayan de Oro",
    date: new Date("2025-10-24"),
    eta: new Date("2025-10-26"),
    status: "For delivery",
    amount: 55000,
    linkedEntriesCount: 0,
  },
];

export function searchBookings(
  query: string,
  companyId: string,
  dateFilter: "today" | "yesterday" | "last7days" | null,
  statusFilters: string[],
  entryDate?: Date
): Booking[] {
  let results = MOCK_BOOKINGS.filter((b) => b.companyId === companyId);

  // Apply search query
  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter(
      (b) =>
        b.bookingNo.toLowerCase().includes(q) ||
        b.client.toLowerCase().includes(q) ||
        b.routeFrom.toLowerCase().includes(q) ||
        b.routeTo.toLowerCase().includes(q)
    );
  }

  // Apply date filter
  if (dateFilter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7days = new Date(today);
    last7days.setDate(last7days.getDate() - 7);

    results = results.filter((b) => {
      const bookingDate = new Date(b.date);
      if (dateFilter === "today") {
        return bookingDate >= today;
      } else if (dateFilter === "yesterday") {
        return bookingDate >= yesterday && bookingDate < today;
      } else if (dateFilter === "last7days") {
        return bookingDate >= last7days;
      }
      return true;
    });
  }

  // Apply status filter
  if (statusFilters.length > 0) {
    results = results.filter((b) => statusFilters.includes(b.status));
  }

  // Ranking/sorting
  results.sort((a, b) => {
    // Boost delivered/closed
    const statusScore = (status: string) => {
      if (status === "Delivered") return 3;
      if (status === "Closed") return 2;
      return 1;
    };
    const scoreDiff = statusScore(b.status) - statusScore(a.status);
    if (scoreDiff !== 0) return scoreDiff;

    // Boost date proximity if entryDate provided
    if (entryDate) {
      const entryTime = entryDate.getTime();
      const aDiff = Math.abs(new Date(a.date).getTime() - entryTime);
      const bDiff = Math.abs(new Date(b.date).getTime() - entryTime);
      const dateDiff = aDiff - bDiff;
      if (Math.abs(dateDiff) > 1000 * 60 * 60 * 24) {
        // More than 1 day difference
        return dateDiff;
      }
    }

    // Most recent first
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return results;
}
