export const formatCurrency = (
  amount: number | string,
  currency: string = "TRY",
  locale?: string,
) => {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return "—";
  const finalLocale = locale ?? (currency === "TRY" ? "tr-TR" : "en-US");
  return new Intl.NumberFormat(finalLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (n: number, locale = "tr-TR") =>
  new Intl.NumberFormat(locale).format(n);

export const formatDuration = (minutes: number, locale = "tr") => {
  if (minutes < 60) return locale === "tr" ? `${minutes} dk` : `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return locale === "tr" ? `${h} sa` : `${h}h`;
  return locale === "tr" ? `${h} sa ${m} dk` : `${h}h ${m}m`;
};

export const formatDateLong = (date: Date | string, locale = "tr-TR") =>
  new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);

export const formatTime = (date: Date | string, locale = "tr-TR") =>
  new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
    typeof date === "string" ? new Date(date) : date,
  );

export const formatRelative = (date: Date | string, locale = "tr-TR") => {
  const target = typeof date === "string" ? new Date(date) : date;
  const diff = target.getTime() - Date.now();
  const minutes = Math.round(diff / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  return formatDateLong(target, locale);
};

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
