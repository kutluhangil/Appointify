import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2 } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useAppointments } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { CustomerDetailSheet } from "@/components/customers/CustomerDetailSheet";
import { CustomersList } from "@/components/customers/CustomersList";

export default function Customers() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { customers, isLoading: loadingCusts, createCustomer } = useCustomers();
  const { appointments, isLoading: loadingAppts } = useAppointments();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selected = useMemo(() => {
    return customers.find(c => c.id === selectedId) || null;
  }, [selectedId, customers]);

  // Derive stats dynamically from appointment history
  const customerStatsMap = useMemo(() => {
    const map: Record<string, { visits: number; spent: number; noShows: number; lastVisit: string | null }> = {};

    // Initialize for all customers
    customers.forEach(c => {
      map[c.id] = { visits: 0, spent: 0, noShows: 0, lastVisit: null };
    });

    appointments.forEach(apt => {
      if (!apt.customer_id || !map[apt.customer_id]) return;
      const item = map[apt.customer_id];
      if (apt.status === "completed") {
        item.visits += 1;
        item.spent += Number(apt.price || 0);
        if (!item.lastVisit || new Date(apt.starts_at) > new Date(item.lastVisit)) {
          item.lastVisit = apt.starts_at;
        }
      } else if (apt.status === "no_show") {
        item.noShows += 1;
      }
    });
    return map;
  }, [appointments, customers]);

  const handleAddCustomerSubmit = async (form: { full_name: string; phone: string; email: string }) => {
    setIsSubmitting(true);
    try {
      await createCustomer({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || null,
        tag: "new",
      });
      setIsAddOpen(false);
      toast({
        title: t("customers.add_success"),
        description: t("customers.add_success_desc", { name: form.full_name, defaultValue: `${form.full_name} başarıyla eklendi.` })
      });
    } catch (err: any) {
      toast({
        title: t("common.error_adding", { defaultValue: "Müşteri eklenemedi" }),
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }, [search, customers]);

  const customerAppointments = useMemo(() => {
    if (!selectedId) return [];
    return appointments
      .filter(a => a.customer_id === selectedId)
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
  }, [selectedId, appointments]);

  const totalNoShows = useMemo(() => {
    return Object.values(customerStatsMap).reduce((sum, item) => sum + item.noShows, 0);
  }, [customerStatsMap]);

  const selectedStats = useMemo(() => {
    if (!selectedId) return null;
    return customerStatsMap[selectedId] || null;
  }, [selectedId, customerStatsMap]);

  const isLoading = loadingCusts || loadingAppts;

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
          <h1 className="text-[13px] font-medium">{t("customers.title")}</h1>
          <Button size="sm" className="h-7 text-[12px] gap-1.5" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> {t("customers.add")}
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-4 max-w-[1400px]">

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
              {[
                { label: t("customers.total"), value: customers.length },
                { label: t("customers.vip"), value: customers.filter(c => c.tag === "VIP").length },
                { label: t("customers.new"), value: customers.filter(c => c.tag === "new").length },
                { label: t("customers.no_show"), value: totalNoShows },
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
                placeholder={t("customers.search_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-[13px] bg-transparent"
              />
            </div>

            {/* Table */}
            <CustomersList
              customers={filtered}
              onSelect={setSelectedId}
              statsMap={customerStatsMap}
            />
          </div>
        </div>
      </div>

      {/* Add Dialog */}
      <AddCustomerDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleAddCustomerSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Detail Sheet */}
      <CustomerDetailSheet
        customer={selected}
        onClose={() => setSelectedId(null)}
        stats={selectedStats}
        appointments={customerAppointments}
      />
    </AppLayout>
  );
}
