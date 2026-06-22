import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export type PaymentWithRelations = Tables<"payments"> & {
  customer: Tables<"customers"> | null;
  appointment: (Tables<"appointments"> & { service: Tables<"services"> | null }) | null;
};

export function usePayments() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;

  const paymentsQuery = useQuery({
    queryKey: ["payments", tenantId],
    queryFn: async (): Promise<PaymentWithRelations[]> => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          customer:customers(*),
          appointment:appointments(
            *,
            service:services(*)
          )
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as any) || [];
    },
    enabled: !!tenantId,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (newPayment: Omit<TablesInsert<"payments">, "tenant_id">) => {
      if (!tenantId) throw new Error("No active tenant");
      const { data, error } = await supabase
        .from("payments")
        .insert({ ...newPayment, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["stats", tenantId] });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<"payments"> }) => {
      const { data, error } = await supabase
        .from("payments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["stats", tenantId] });
    },
  });

  return {
    payments: paymentsQuery.data || [],
    isLoading: paymentsQuery.isLoading,
    error: paymentsQuery.error,
    createPayment: createPaymentMutation.mutateAsync,
    isCreating: createPaymentMutation.isPending,
    updatePayment: updatePaymentMutation.mutateAsync,
    isUpdating: updatePaymentMutation.isPending,
  };
}
