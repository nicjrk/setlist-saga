import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Setlist } from "@/types/song";

export function useSetlists() {
  return useQuery({
    queryKey: ["setlists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("setlists")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Setlist[];
    },
  });
}

export function useSetlist(id: string | undefined) {
  return useQuery({
    queryKey: ["setlist", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("setlists")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Setlist | null;
    },
  });
}

export function useDeleteSetlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("setlists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["setlists"] });
    },
  });
}