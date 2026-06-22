import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type Customer = Tables<"customers">;

export function useCustomers() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;

  const customersQuery = useQuery({
    queryKey: ["customers", tenantId],
    queryFn: async (): Promise<Customer[]> => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("full_name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (newCustomer: Omit<TablesInsert<"customers">, "tenant_id">) => {
      if (!tenantId) throw new Error("No active tenant");
      const { data, error } = await supabase
        .from("customers")
        .insert({ ...newCustomer, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", tenantId] });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<"customers"> }) => {
      const { data, error } = await supabase
        .from("customers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["customer", variables.id] });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", tenantId] });
    },
  });

  return {
    customers: customersQuery.data || [],
    isLoading: customersQuery.isLoading,
    error: customersQuery.error,
    createCustomer: createCustomerMutation.mutateAsync,
    isCreating: createCustomerMutation.isPending,
    updateCustomer: updateCustomerMutation.mutateAsync,
    isUpdating: updateCustomerMutation.isPending,
    deleteCustomer: deleteCustomerMutation.mutateAsync,
    isDeleting: deleteCustomerMutation.isPending,
  };
}

export function useCustomer(id?: string) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: async (): Promise<Customer | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
