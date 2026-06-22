import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type Staff = Tables<"staff">;

export function useStaff(tenantIdOverride?: string) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const tenantId = tenantIdOverride || profile?.tenant_id;

  const staffQuery = useQuery({
    queryKey: ["staff", tenantId],
    queryFn: async (): Promise<Staff[]> => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("full_name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });

  const createStaffMutation = useMutation({
    mutationFn: async (newStaff: Omit<TablesInsert<"staff">, "tenant_id">) => {
      if (!tenantId) throw new Error("No active tenant");
      const { data, error } = await supabase
        .from("staff")
        .insert({ ...newStaff, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", tenantId] });
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<"staff"> }) => {
      const { data, error } = await supabase
        .from("staff")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["staff-member", variables.id] });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", tenantId] });
    },
  });

  return {
    staff: staffQuery.data || [],
    isLoading: staffQuery.isLoading,
    error: staffQuery.error,
    createStaff: createStaffMutation.mutateAsync,
    isCreating: createStaffMutation.isPending,
    updateStaff: updateStaffMutation.mutateAsync,
    isUpdating: updateStaffMutation.isPending,
    deleteStaff: deleteStaffMutation.mutateAsync,
    isDeleting: deleteStaffMutation.isPending,
  };
}

export function useStaffMember(id?: string) {
  return useQuery({
    queryKey: ["staff-member", id],
    queryFn: async (): Promise<Staff | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
