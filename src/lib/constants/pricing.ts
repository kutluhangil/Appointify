export type PlanId = "solo" | "team" | "business" | "enterprise";
export type Region = "global" | "tr";
export type BillingCycle = "monthly" | "yearly";

export interface PlanLimits {
  monthly: number;
  yearly: number;
  staffLimit: number;
  locationLimit: number;
  appointmentLimit: number;
  customerLimit: number;
}

export const PRICING: Record<
  Region,
  { currency: string; symbol: string; plans: Record<PlanId, PlanLimits> }
> = {
  global: {
    currency: "USD",
    symbol: "$",
    plans: {
      solo: { monthly: 29, yearly: 278, staffLimit: 1, locationLimit: 1, appointmentLimit: 200, customerLimit: 500 },
      team: { monthly: 49, yearly: 470, staffLimit: 5, locationLimit: 1, appointmentLimit: 500, customerLimit: 2000 },
      business: { monthly: 79, yearly: 758, staffLimit: 15, locationLimit: 3, appointmentLimit: 2000, customerLimit: 10000 },
      enterprise: { monthly: 149, yearly: 1430, staffLimit: -1, locationLimit: -1, appointmentLimit: -1, customerLimit: -1 },
    },
  },
  tr: {
    currency: "TRY",
    symbol: "₺",
    plans: {
      solo: { monthly: 899, yearly: 8630, staffLimit: 1, locationLimit: 1, appointmentLimit: 200, customerLimit: 500 },
      team: { monthly: 1499, yearly: 14390, staffLimit: 5, locationLimit: 1, appointmentLimit: 500, customerLimit: 2000 },
      business: { monthly: 2499, yearly: 23990, staffLimit: 15, locationLimit: 3, appointmentLimit: 2000, customerLimit: 10000 },
      enterprise: { monthly: 4999, yearly: 47990, staffLimit: -1, locationLimit: -1, appointmentLimit: -1, customerLimit: -1 },
    },
  },
};

export const TRIAL_DAYS = 14;
export const YEARLY_DISCOUNT = 0.2;

export const PLAN_FEATURES: Record<PlanId, string[]> = {
  solo: [
    "1 personel",
    "1 lokasyon",
    "Aylık 200 randevu",
    "500 müşteri kaydı",
    "Online booking",
    "E-posta hatırlatma",
    "Temel raporlar",
  ],
  team: [
    "5 personel",
    "1 lokasyon",
    "Aylık 500 randevu",
    "2.000 müşteri kaydı",
    "SMS hatırlatma",
    "Depozito alma",
    "Müşteri portalı",
  ],
  business: [
    "15 personel",
    "3 lokasyon",
    "Aylık 2.000 randevu",
    "10.000 müşteri kaydı",
    "WhatsApp entegrasyonu",
    "Gelişmiş raporlar",
    "Özel markalama",
    "Öncelikli destek",
  ],
  enterprise: [
    "Sınırsız personel",
    "Sınırsız lokasyon",
    "Sınırsız randevu",
    "Sınırsız müşteri",
    "API erişimi",
    "Özel hesap yöneticisi",
    "SLA garantisi",
  ],
};

export const PLAN_FEATURES_EN: Record<PlanId, string[]> = {
  solo: ["1 staff", "1 location", "200 appointments / mo", "500 customers", "Online booking", "Email reminders", "Basic reports"],
  team: ["5 staff", "1 location", "500 appointments / mo", "2,000 customers", "SMS reminders", "Deposits", "Customer portal"],
  business: [
    "15 staff",
    "3 locations",
    "2,000 appointments / mo",
    "10,000 customers",
    "WhatsApp integration",
    "Advanced reports",
    "Custom branding",
    "Priority support",
  ],
  enterprise: [
    "Unlimited staff",
    "Unlimited locations",
    "Unlimited appointments",
    "Unlimited customers",
    "API access",
    "Dedicated manager",
    "SLA guarantee",
  ],
};
