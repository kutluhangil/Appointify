import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Plus, Phone, Mail, Star, TrendingUp, CalendarDays, AlertTriangle } from "lucide-react";
import { sampleCustomers, sampleAppointments, sampleServices, sampleStaff } from "@/lib/sample-data";
import { formatCurrency, formatRelative, formatTime } from "@/lib/format";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const TAG_COLORS: Record<string, string> = {
  VIP:     "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  regular: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  new:     "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
};

export default function Customers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof sampleCustomers[0] | null>(null);

  const filtered = useMemo(() => {
    if (!search) return sampleCustomers;
    const q = search.toLowerCase();
    return sampleCustomers.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }, [search]);

  const customerAppointments = useMemo(() => {
    if (!selected) return [];
    return sampleAppointments
      .filter(a => a.customer_id === selected.id)
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }, [selected]);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 md:px-6 h-12 border-b border-border shrink-0">
          <h1 className="text-[13px] font-medium">Müşteriler</h1>
          <Button size="sm" className="h-7 text-[12px] gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Müşteri Ekle
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-4 max-w-[1400px]">

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
              {[
                { label: "Toplam Müşteri", value: sampleCustomers.length },
                { label: "VIP Müşteri", value: sampleCustomers.filter(c => c.tags.includes("VIP")).length },
                { label: "Yeni Müşteri", value: sampleCustomers.filter(c => c.tags.includes("new")).length },
                { label: "Gelmedi (no-show)", value: sampleCustomers.reduce((s, c) => s + c.no_show_count, 0) },
              ].map((s, i) => (
                <div key={i} className="bg-card p-4">
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  <p className="text-[22px] font-semibold mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="İsim, telefon veya e-posta ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-[13px] bg-transparent"
              />
            </div>

            {/* Table */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Müşteri</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px] hidden md:table-cell">İletişim</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Ziyaret</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px] hidden md:table-cell">Toplam Harcama</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px] hidden md:table-cell">Son Ziyaret</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Etiket</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => setSelected(c)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">
                            {c.full_name.split(" ").map(n => n[0]).join("").slice(0,2)}
                          </div>
                          <span className="font-medium">{c.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        <p className="text-[12px]">{c.phone}</p>
                        <p className="text-[11px]">{c.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{c.total_visits}</span>
                          {c.no_show_count > 0 && (
                            <span className="text-[10px] text-orange-500 ml-1">({c.no_show_count} gelmedi)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium hidden md:table-cell">{formatCurrency(c.total_spent)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-[12px] hidden md:table-cell">
                        {formatRelative(c.last_visit_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {c.tags.map(tag => (
                            <span key={tag} className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${TAG_COLORS[tag] || "bg-muted text-muted-foreground border-border"}`}>
                              {tag === "VIP" ? "⭐ VIP" : tag === "new" ? "Yeni" : "Düzenli"}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Customer detail sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-[13px] font-medium">
                    {selected.full_name.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <p className="font-semibold text-[15px]">{selected.full_name}</p>
                    <div className="flex gap-1 mt-0.5">
                      {selected.tags.map(tag => (
                        <span key={tag} className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${TAG_COLORS[tag] || "bg-muted text-muted-foreground border-border"}`}>
                          {tag === "VIP" ? "⭐ VIP" : tag === "new" ? "Yeni" : "Düzenli"}
                        </span>
                      ))}
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Contact */}
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">İletişim</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[13px]">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selected.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px]">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selected.email}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Toplam Ziyaret", value: selected.total_visits, icon: CalendarDays },
                    { label: "Toplam Harcama", value: formatCurrency(selected.total_spent), icon: TrendingUp },
                    { label: "Gelmedi", value: selected.no_show_count, icon: AlertTriangle },
                  ].map((s, i) => (
                    <div key={i} className="border border-border rounded-lg p-3 text-center">
                      <s.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                      <p className="text-[16px] font-semibold">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Appointment history */}
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Randevu Geçmişi</p>
                  <div className="space-y-2">
                    {customerAppointments.length === 0 ? (
                      <p className="text-[13px] text-muted-foreground">Randevu bulunamadı</p>
                    ) : (
                      customerAppointments.map((apt) => {
                        const service = sampleServices.find(s => s.id === apt.service_id);
                        const staff = sampleStaff.find(s => s.id === apt.staff_id);
                        return (
                          <div key={apt.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium">{service?.name_tr}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {staff?.name} · {format(new Date(apt.start_time), "d MMM yyyy", { locale: tr })} {formatTime(apt.start_time)}
                              </p>
                            </div>
                            <p className="text-[12px] font-medium shrink-0">{formatCurrency(apt.price)}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
