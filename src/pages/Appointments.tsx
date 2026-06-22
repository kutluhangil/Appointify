import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/useAppointments";
import { useCustomers } from "@/hooks/useCustomers";
import { useStaff } from "@/hooks/useStaff";
import { useServices } from "@/hooks/useServices";
import { useTranslation } from "react-i18next";

import { AddAppointmentDialog } from "@/components/appointments/AddAppointmentDialog";
import { AppointmentDetailDialog } from "@/components/appointments/AppointmentDetailDialog";
import { AppointmentsList } from "@/components/appointments/AppointmentsList";
import { AppointmentsCalendar } from "@/components/appointments/AppointmentsCalendar";

type ViewMode = "list" | "calendar";

export default function Appointments() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [view, setView] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);

  const { appointments, isLoading: loadingAppts, createAppointment, updateAppointment } = useAppointments();
  const { customers, isLoading: loadingCusts } = useCustomers();
  const { staff, isLoading: loadingStaff } = useStaff();
  const { services, isLoading: loadingServices } = useServices();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setIsAddOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, []);

  const selectedApt = useMemo(() => {
    return appointments.find((a) => a.id === selectedAptId) || null;
  }, [selectedAptId, appointments]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateAppointment({ id, updates: { status } });
      setSelectedAptId(null);
      toast({
        title: status === "cancelled" ? t("appointments.cancel_success") : t("appointments.complete_success"),
      });
    } catch (err: any) {
      toast({
        title: t("common.error_updating", { defaultValue: "Güncelleme başarısız" }),
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleAddAppointmentSubmit = async (form: {
    customer_id: string;
    service_id: string;
    staff_id: string;
    date: string;
    time: string;
  }) => {
    setIsSubmitting(true);
    try {
      const service = services.find((s) => s.id === form.service_id);
      if (!service) throw new Error("Seçilen hizmet bulunamadı");

      const startDt = new Date(`${form.date}T${form.time}:00`);
      const endDt = new Date(startDt.getTime() + service.duration_min * 60 * 1000);

      await createAppointment({
        customer_id: form.customer_id,
        service_id: form.service_id,
        staff_id: form.staff_id || null,
        starts_at: startDt.toISOString(),
        ends_at: endDt.toISOString(),
        price: service.price || 0,
        currency: service.currency || "TRY",
        status: "confirmed",
      });

      setIsAddOpen(false);
      toast({ title: t("appointments.add_success") });
    } catch (err: any) {
      toast({
        title: t("common.error_adding", { defaultValue: "Randevu eklenemedi" }),
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return appointments
      .filter((apt) => {
        const matchSearch =
          !search ||
          apt.customer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          apt.service?.name?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || apt.status === statusFilter;
        const matchStaff = staffFilter === "all" || apt.staff_id === staffFilter;
        return matchSearch && matchStatus && matchStaff;
      })
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
  }, [search, statusFilter, staffFilter, appointments]);

  const isLoading = loadingAppts || loadingCusts || loadingStaff || loadingServices;

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
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 h-12 border-b border-border shrink-0">
          <h1 className="text-[13px] font-medium">{t("appointments.title")}</h1>
          <Button size="sm" className="h-7 text-[12px] gap-1.5" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> {t("appointments.add")}
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-4 max-w-[1400px]">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={t("appointments.search_placeholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-[13px] bg-transparent"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-[13px] w-36">
                  <SelectValue placeholder={t("appointments.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("appointments.all_statuses")}</SelectItem>
                  <SelectItem value="pending">{t("payments.pending_status", { defaultValue: "Bekliyor" })}</SelectItem>
                  <SelectItem value="confirmed">{t("dashboard.confirmed", { defaultValue: "Onaylı" })}</SelectItem>
                  <SelectItem value="in_progress">{t("common.in_progress", { defaultValue: "Devam Ediyor" })}</SelectItem>
                  <SelectItem value="completed">{t("payments.completed_status", { defaultValue: "Tamamlandı" })}</SelectItem>
                  <SelectItem value="cancelled">{t("appointments.cancel", { defaultValue: "İptal" })}</SelectItem>
                  <SelectItem value="no_show">{t("customers.no_show", { defaultValue: "Gelmedi" })}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={staffFilter} onValueChange={setStaffFilter}>
                <SelectTrigger className="h-8 text-[13px] w-36">
                  <SelectValue placeholder={t("appointments.staff_member")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("appointments.all_staff")}</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto flex items-center border border-border rounded-md overflow-hidden">
                <button
                  onClick={() => setView("list")}
                  className={`px-3 py-1.5 text-[12px] transition-colors ${
                    view === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("appointments.view_list")}
                </button>
                <button
                  onClick={() => setView("calendar")}
                  className={`px-3 py-1.5 text-[12px] transition-colors ${
                    view === "calendar" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("appointments.view_calendar")}
                </button>
              </div>
            </div>

            {/* Main view */}
            {view === "calendar" ? (
              <AppointmentsCalendar
                appointments={appointments}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onSelectAppointment={setSelectedAptId}
              />
            ) : (
              <AppointmentsList appointments={filtered} onSelect={setSelectedAptId} />
            )}
          </div>
        </div>
      </div>

      {/* Add dialog */}
      <AddAppointmentDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        customers={customers}
        services={services}
        staff={staff}
        onSubmit={handleAddAppointmentSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Detail dialog */}
      <AppointmentDetailDialog
        appointment={selectedApt}
        onClose={() => setSelectedAptId(null)}
        onStatusChange={handleStatusChange}
      />
    </AppLayout>
  );
}
