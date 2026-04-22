import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BandMember } from "@/types/song";

export function useBandMembers() {
  return useQuery({
    queryKey: ["band_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("band_members")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as BandMember[];
    },
  });
}

export function useDeleteBandMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("band_members")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["band_members"] });
    },
  });
}