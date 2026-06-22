import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CreditCard, Banknote, TrendingUp, Clock, Loader2 } from "lucide-react";
import { usePayments, PaymentWithRelations } from "@/hooks/usePayments";
import { formatCurrency, formatRelative } from "@/lib/format";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

const PAYMENT_STATUS: Record<string, { labelKey: string; defaultLabel: string; color: string }> = {
  completed: { labelKey: "payments.completed_status", defaultLabel: "Tamamlandı", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  pending:   { labelKey: "payments.pending_status",   defaultLabel: "Bekliyor",   color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  failed:    { labelKey: "payments.failed_status",    defaultLabel: "Başarısız",  color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  refunded:  { labelKey: "payments.refunded_status",  defaultLabel: "İade Edildi", color: "bg-muted/60 text-muted-foreground" },
};

const METHOD_ICONS: Record<string, React.ElementType> = {
  card:   CreditCard,
  cash:   Banknote,
  manual: Banknote,
};

export default function Payments() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "tr" ? tr : enUS;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { payments, isLoading } = usePayments();

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = !search || p.customer?.full_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, payments]);

  const totalRevenue = useMemo(() => {
    return payments.filter(p => p.status === "completed").reduce((s, p) => s + Number(p.amount), 0);
  }, [payments]);

  const pendingAmount = useMemo(() => {
    return payments.filter(p => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);
  }, [payments]);

  const depositCount = useMemo(() => {
    return payments.filter(p => p.appointment && Number(p.amount) < Number(p.appointment.price || 0)).length;
  }, [payments]);

  const getPaymentTypeLabel = (p: PaymentWithRelations) => {
    if (p.appointment && Number(p.amount) < Number(p.appointment.price || 0)) {
      return t("payments.deposit_type", { defaultValue: "Depozito" });
    }
    return t("payments.full_type", { defaultValue: "Tam Ödeme" });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-3rem)] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 md:px-6 h-12 border-b border-border shrink-0">
          <h1 className="text-[13px] font-medium">{t("payments.title")}</h1>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
              {[
                { label: t("payments.revenue"), value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-green-500" },
                { label: t("payments.pending"), value: formatCurrency(pendingAmount), icon: Clock, color: "text-yellow-500" },
                { label: t("payments.transactions"), value: payments.length, icon: CreditCard, color: "text-blue-500" },
                { label: t("payments.deposits"), value: depositCount, icon: Banknote, color: "text-purple-500" },
              ].map((s, i) => (
                <div key={i} className="bg-card p-4 flex items-start justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    <p className="text-[20px] font-semibold mt-1">{s.value}</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={t("payments.search_placeholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-[13px] bg-transparent"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-[13px] w-36">
                  <SelectValue placeholder={t("payments.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("payments.all_statuses")}</SelectItem>
                  {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{t(v.labelKey, { defaultValue: v.defaultLabel })}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payments table */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("payments.customer")}</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("payments.service")}</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px] hidden md:table-cell">{t("payments.type")}</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px] hidden md:table-cell">{t("payments.method")}</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("payments.amount")}</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("payments.status")}</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px] hidden md:table-cell">{t("payments.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground text-[13px]">
                        {t("payments.not_found")}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const cfg = PAYMENT_STATUS[p.status || "pending"] ?? PAYMENT_STATUS.pending;
                      const method = p.method || "card";
                      const MethodIcon = METHOD_ICONS[method] ?? CreditCard;
                      const typeLabel = getPaymentTypeLabel(p);
                      return (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">
                                {p.customer?.full_name?.split(" ").map(n => n[0]).join("").slice(0,2) || "M"}
                              </div>
                              <span className="font-medium">{p.customer?.full_name || t("common.unknown_customer", { defaultValue: "Bilinmeyen Müşteri" })}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {p.appointment?.service?.name ?? (
                              <span className="italic text-muted-foreground/60">{typeLabel}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                            {typeLabel}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MethodIcon className="h-3.5 w-3.5" />
                              <span className="text-[12px] capitalize">{method === "card" ? t("payments.card") : t("payments.cash")}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold">{formatCurrency(Number(p.amount), p.currency || "TRY")}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                              {t(cfg.labelKey, { defaultValue: cfg.defaultLabel })}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-[12px] hidden md:table-cell">
                            {p.created_at ? format(new Date(p.created_at), "d MMM yyyy", { locale: dateLocale }) : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
