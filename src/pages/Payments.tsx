import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CreditCard, Banknote, TrendingUp, Clock } from "lucide-react";
import { samplePayments, sampleCustomers, sampleAppointments, sampleServices } from "@/lib/sample-data";
import { formatCurrency, formatRelative } from "@/lib/format";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  completed: { label: "Tamamlandı", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  pending:   { label: "Bekliyor",   color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  failed:    { label: "Başarısız",  color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  refunded:  { label: "İade Edildi", color: "bg-muted/60 text-muted-foreground" },
};

const PAYMENT_TYPE: Record<string, string> = {
  full_payment: "Tam Ödeme",
  deposit:      "Depozito",
  refund:       "İade",
};

const METHOD_ICONS: Record<string, React.ElementType> = {
  card:   CreditCard,
  cash:   Banknote,
  manual: Banknote,
};

export default function Payments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return samplePayments.filter(p => {
      const customer = sampleCustomers.find(c => c.id === p.customer_id);
      const matchSearch = !search || customer?.full_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const totalRevenue = samplePayments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const pendingAmount = samplePayments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const depositCount = samplePayments.filter(p => p.type === "deposit").length;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 md:px-6 h-12 border-b border-border shrink-0">
          <h1 className="text-[13px] font-medium">Ödemeler</h1>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
              {[
                { label: "Toplam Gelir", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-green-500" },
                { label: "Bekleyen", value: formatCurrency(pendingAmount), icon: Clock, color: "text-yellow-500" },
                { label: "Toplam İşlem", value: samplePayments.length, icon: CreditCard, color: "text-blue-500" },
                { label: "Depozito Sayısı", value: depositCount, icon: Banknote, color: "text-purple-500" },
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
                  placeholder="Müşteri ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-[13px] bg-transparent"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-[13px] w-36">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payments table */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Müşteri</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Hizmet</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px] hidden md:table-cell">Tür</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px] hidden md:table-cell">Yöntem</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Tutar</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Durum</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px] hidden md:table-cell">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground text-[13px]">
                        Ödeme bulunamadı
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const customer = sampleCustomers.find(c => c.id === p.customer_id);
                      const apt = sampleAppointments.find(a => a.id === p.appointment_id);
                      const service = sampleServices.find(s => s.id === apt?.service_id);
                      const cfg = PAYMENT_STATUS[p.status] ?? PAYMENT_STATUS.pending;
                      const MethodIcon = METHOD_ICONS[p.payment_method] ?? CreditCard;
                      return (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">
                                {customer?.full_name.split(" ").map(n => n[0]).join("").slice(0,2)}
                              </div>
                              <span className="font-medium">{customer?.full_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {service?.name_tr ?? (
                              <span className="italic text-muted-foreground/60">{PAYMENT_TYPE[p.type] ?? "Genel"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                            {PAYMENT_TYPE[p.type] ?? p.type}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MethodIcon className="h-3.5 w-3.5" />
                              <span className="text-[12px] capitalize">{p.payment_method === "card" ? "Kart" : "Nakit"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold">{formatCurrency(p.amount, p.currency)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-[12px] hidden md:table-cell">
                            {format(new Date(p.created_at), "d MMM yyyy", { locale: tr })}
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
