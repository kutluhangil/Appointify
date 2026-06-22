import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export type AppointmentWithRelations = Tables<"appointments"> & {
  customer: Tables<"customers"> | null;
  service: Tables<"services"> | null;
  staff: Tables<"staff"> | null;
};

export function useAppointments(filters?: { startDate?: string; endDate?: string }) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", tenantId, filters],
    queryFn: async (): Promise<AppointmentWithRelations[]> => {
      if (!tenantId) return [];
      let query = supabase
        .from("appointments")
        .select(`
          *,
          customer:customers(*),
          service:services(*),
          staff:staff(*)
        `)
        .eq("tenant_id", tenantId);

      if (filters?.startDate) {
        query = query.gte("starts_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("ends_at", filters.endDate);
      }

      const { data, error } = await query.order("starts_at", { ascending: true });

      if (error) throw error;
      return (data as any) || [];
    },
    enabled: !!tenantId,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (newAppointment: Omit<TablesInsert<"appointments">, "tenant_id">) => {
      if (!tenantId) throw new Error("No active tenant");
      const { data, error } = await supabase
        .from("appointments")
        .insert({ ...newAppointment, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["stats", tenantId] });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<"appointments"> }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["appointment", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["stats", tenantId] });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["stats", tenantId] });
    },
  });

  return {
    appointments: appointmentsQuery.data || [],
    isLoading: appointmentsQuery.isLoading,
    error: appointmentsQuery.error,
    createAppointment: createAppointmentMutation.mutateAsync,
    isCreating: createAppointmentMutation.isPending,
    updateAppointment: updateAppointmentMutation.mutateAsync,
    isUpdating: updateAppointmentMutation.isPending,
    deleteAppointment: deleteAppointmentMutation.mutateAsync,
    isDeleting: deleteAppointmentMutation.isPending,
  };
}

export function useAppointment(id?: string) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: async (): Promise<AppointmentWithRelations | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          customer:customers(*),
          service:services(*),
          staff:staff(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });
}
