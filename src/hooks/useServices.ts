import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type Service = Tables<"services">;

export function useServices(tenantIdOverride?: string) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const tenantId = tenantIdOverride || profile?.tenant_id;

  const servicesQuery = useQuery({
    queryKey: ["services", tenantId],
    queryFn: async (): Promise<Service[]> => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });

  const createServiceMutation = useMutation({
    mutationFn: async (newService: Omit<TablesInsert<"services">, "tenant_id">) => {
      if (!tenantId) throw new Error("No active tenant");
      const { data, error } = await supabase
        .from("services")
        .insert({ ...newService, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", tenantId] });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<"services"> }) => {
      const { data, error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["services", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["service", variables.id] });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", tenantId] });
    },
  });

  return {
    services: servicesQuery.data || [],
    isLoading: servicesQuery.isLoading,
    error: servicesQuery.error,
    createService: createServiceMutation.mutateAsync,
    isCreating: createServiceMutation.isPending,
    updateService: updateServiceMutation.mutateAsync,
    isUpdating: updateServiceMutation.isPending,
    deleteService: deleteServiceMutation.mutateAsync,
    isDeleting: deleteServiceMutation.isPending,
  };
}

export function useService(id?: string) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: async (): Promise<Service | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
