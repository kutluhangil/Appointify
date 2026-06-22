import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type Tenant = Tables<"tenants">;

export function useTenant(tenantId?: string) {
  const queryClient = useQueryClient();
  const { profile, refreshProfile } = useAuth();
  const activeTenantId = tenantId || profile?.tenant_id;

  const tenantQuery = useQuery({
    queryKey: ["tenant", activeTenantId],
    queryFn: async (): Promise<Tenant | null> => {
      if (!activeTenantId) return null;
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", activeTenantId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!activeTenantId,
  });

  const updateTenantMutation = useMutation({
    mutationFn: async (updates: TablesUpdate<"tenants">) => {
      if (!activeTenantId) throw new Error("No active tenant to update");
      const { data, error } = await supabase
        .from("tenants")
        .update(updates)
        .eq("id", activeTenantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", activeTenantId] });
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
      // 1. Create the tenant
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({ name, slug })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // 2. Link profile to this tenant
      if (profile?.user_id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ tenant_id: tenant.id, role: "owner" })
          .eq("user_id", profile.user_id);

        if (profileError) throw profileError;
        await refreshProfile();
      }

      return tenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
    },
  });

  return {
    tenant: tenantQuery.data,
    isLoading: tenantQuery.isLoading,
    error: tenantQuery.error,
    updateTenant: updateTenantMutation.mutateAsync,
    isUpdating: updateTenantMutation.isPending,
    createTenant: createTenantMutation.mutateAsync,
    isCreating: createTenantMutation.isPending,
  };
}

export function useTenantBySlug(slug?: string) {
  return useQuery({
    queryKey: ["tenant-by-slug", slug],
    queryFn: async (): Promise<Tenant | null> => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}
