// Demo / sample data used by hooks until live Supabase queries are wired in.

export type SampleAppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

const today = new Date();
const at = (daysOffset: number, hour: number, minute = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const sampleStaff = [
  { id: "s1", name: "Ali Kaya", avatar_url: "", specialties: ["Saç kesimi", "Sakal"], color: "#a78bfa" },
  { id: "s2", name: "Selin Demir", avatar_url: "", specialties: ["Boyama", "Bakım"], color: "#34d399" },
  { id: "s3", name: "Mert Aydın", avatar_url: "", specialties: ["Tıraş"], color: "#f472b6" },
];

export const sampleServices = [
  { id: "sv1", name_tr: "Saç Kesim", name_en: "Haircut", duration: 30, price: 250, currency: "TRY", color: "#a78bfa" },
  { id: "sv2", name_tr: "Sakal Tıraşı", name_en: "Beard Trim", duration: 20, price: 150, currency: "TRY", color: "#34d399" },
  { id: "sv3", name_tr: "Saç Boyama", name_en: "Hair Coloring", duration: 90, price: 850, currency: "TRY", color: "#f472b6" },
  { id: "sv4", name_tr: "Saç Yıkama", name_en: "Hair Wash", duration: 15, price: 100, currency: "TRY", color: "#60a5fa" },
  { id: "sv5", name_tr: "Tıraş + Boya Kombo", name_en: "Trim + Color Combo", duration: 110, price: 950, currency: "TRY", color: "#fbbf24" },
];

export const sampleCustomers = [
  { id: "c1", full_name: "Emre Yılmaz", phone: "+90 532 111 22 33", email: "emre@example.com", total_visits: 8, total_spent: 2400, last_visit_at: at(-7, 11), tags: ["VIP"], no_show_count: 0 },
  { id: "c2", full_name: "Zeynep Aksoy", phone: "+90 533 222 33 44", email: "zeynep@example.com", total_visits: 12, total_spent: 4800, last_visit_at: at(-2, 15), tags: ["regular"], no_show_count: 0 },
  { id: "c3", full_name: "Burak Şahin", phone: "+90 535 333 44 55", email: "burak@example.com", total_visits: 3, total_spent: 600, last_visit_at: at(-14, 10), tags: ["new"], no_show_count: 1 },
  { id: "c4", full_name: "Deniz Kara", phone: "+90 536 444 55 66", email: "deniz@example.com", total_visits: 6, total_spent: 2100, last_visit_at: at(-5, 14), tags: ["regular", "VIP"], no_show_count: 0 },
  { id: "c5", full_name: "Aylin Çelik", phone: "+90 537 555 66 77", email: "aylin@example.com", total_visits: 1, total_spent: 250, last_visit_at: at(-21, 13), tags: ["new"], no_show_count: 0 },
];

export const sampleAppointments: Array<{
  id: string;
  customer_id: string;
  staff_id: string;
  service_id: string;
  status: SampleAppointmentStatus;
  start_time: string;
  end_time: string;
  price: number;
  currency: string;
  notes?: string;
}> = [
  { id: "a1", customer_id: "c1", staff_id: "s1", service_id: "sv1", status: "confirmed", start_time: at(0, 10), end_time: at(0, 10, 30), price: 250, currency: "TRY" },
  { id: "a2", customer_id: "c2", staff_id: "s2", service_id: "sv3", status: "confirmed", start_time: at(0, 11, 30), end_time: at(0, 13), price: 850, currency: "TRY" },
  { id: "a3", customer_id: "c3", staff_id: "s1", service_id: "sv2", status: "pending", start_time: at(0, 15), end_time: at(0, 15, 20), price: 150, currency: "TRY" },
  { id: "a4", customer_id: "c4", staff_id: "s3", service_id: "sv5", status: "confirmed", start_time: at(1, 10), end_time: at(1, 11, 50), price: 950, currency: "TRY" },
  { id: "a5", customer_id: "c5", staff_id: "s2", service_id: "sv4", status: "completed", start_time: at(-1, 14), end_time: at(-1, 14, 15), price: 100, currency: "TRY" },
  { id: "a6", customer_id: "c1", staff_id: "s1", service_id: "sv1", status: "completed", start_time: at(-2, 9), end_time: at(-2, 9, 30), price: 250, currency: "TRY" },
  { id: "a7", customer_id: "c2", staff_id: "s2", service_id: "sv3", status: "cancelled", start_time: at(-3, 13), end_time: at(-3, 14, 30), price: 850, currency: "TRY" },
  { id: "a8", customer_id: "c3", staff_id: "s1", service_id: "sv2", status: "no_show", start_time: at(-4, 16), end_time: at(-4, 16, 20), price: 150, currency: "TRY" },
  { id: "a9", customer_id: "c4", staff_id: "s3", service_id: "sv1", status: "confirmed", start_time: at(2, 11), end_time: at(2, 11, 30), price: 250, currency: "TRY" },
  { id: "a10", customer_id: "c5", staff_id: "s2", service_id: "sv4", status: "confirmed", start_time: at(2, 14), end_time: at(2, 14, 15), price: 100, currency: "TRY" },
  { id: "a11", customer_id: "c2", staff_id: "s1", service_id: "sv5", status: "confirmed", start_time: at(3, 10), end_time: at(3, 11, 50), price: 950, currency: "TRY" },
  { id: "a12", customer_id: "c1", staff_id: "s2", service_id: "sv3", status: "confirmed", start_time: at(4, 13), end_time: at(4, 14, 30), price: 850, currency: "TRY" },
];

export const samplePayments = [
  { id: "p1", appointment_id: "a5", customer_id: "c5", amount: 100, currency: "TRY", type: "full_payment", status: "completed", payment_method: "card", provider: "iyzico", created_at: at(-1, 14) },
  { id: "p2", appointment_id: "a6", customer_id: "c1", amount: 250, currency: "TRY", type: "full_payment", status: "completed", payment_method: "cash", provider: "manual", created_at: at(-2, 9) },
  { id: "p3", appointment_id: "a4", customer_id: "c4", amount: 237, currency: "TRY", type: "deposit", status: "completed", payment_method: "card", provider: "iyzico", created_at: at(0, 8) },
  { id: "p4", appointment_id: "a2", customer_id: "c2", amount: 212, currency: "TRY", type: "deposit", status: "pending", payment_method: "card", provider: "iyzico", created_at: at(0, 8) },
];

export const sampleStats = {
  todayAppointments: 3,
  weekRevenue: 5200,
  totalCustomers: sampleCustomers.length,
  avgBookingValue: 433,
  weekRevenueSeries: [
    { day: "Pzt", revenue: 850 },
    { day: "Sal", revenue: 1200 },
    { day: "Çar", revenue: 950 },
    { day: "Per", revenue: 1400 },
    { day: "Cum", revenue: 800 },
    { day: "Cmt", revenue: 0 },
    { day: "Paz", revenue: 0 },
  ],
};
