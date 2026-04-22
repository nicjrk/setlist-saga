import { useEffect, useState } from "react";
import { Plus, Trash2, Users, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useBandMembers, useDeleteBandMember } from "@/hooks/useBandMembers";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InstrumentPicker } from "@/components/InstrumentPicker";
import type { BandMember } from "@/types/song";

export default function Members() {
  const { data: members, isLoading } = useBandMembers();
  const del = useDeleteBandMember();
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BandMember | null>(null);
  const [name, setName] = useState("");
  const [instruments, setInstruments] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setInstruments(editing?.instruments ?? []);
    }
  }, [open, editing]);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (m: BandMember) => {
    setEditing(m);
    setOpen(true);
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error("Numele este obligatoriu");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        instruments: instruments as unknown as never,
      };
      if (editing) {
        const { error } = await supabase
          .from("band_members")
          .update(payload as never)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Membru actualizat");
      } else {
        const { error } = await supabase
          .from("band_members")
          .insert(payload as never);
        if (error) throw error;
        toast.success("Membru adăugat");
      }
      qc.invalidateQueries({ queryKey: ["band_members"] });
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Salvarea a eșuat");
    } finally {
      setSaving(false);
    }
  };

  const remove = (m: BandMember) => {
    if (!confirm(`Ștergi ${m.name}?`)) return;
    del.mutate(m.id, {
      onSuccess: () => toast.success("Membru șters"),
      onError: () => toast.error("Ștergerea a eșuat"),
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membri</h1>
          <p className="text-sm text-muted-foreground">Trupa și instrumentele</p>
        </div>
        <Button size="lg" className="h-11" onClick={openNew}>
          <Plus className="mr-1 h-5 w-5" /> Adaugă
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && (members?.length ?? 0) === 0 && (
        <Card className="flex flex-col items-center gap-3 px-4 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <p className="font-medium">Nu există membri</p>
          <p className="text-sm text-muted-foreground">
            Adaugă membrii trupei și instrumentele lor.
          </p>
          <Button className="mt-2" onClick={openNew}>
            <Plus className="mr-1 h-4 w-4" /> Adaugă membru
          </Button>
        </Card>
      )}

      <ul className="space-y-2">
        {members?.map((m) => (
          <li key={m.id}>
            <Card className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => openEdit(m)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-base font-semibold">{m.name}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(m.instruments ?? []).length === 0 ? (
                    <span className="text-xs text-muted-foreground">
                      Niciun instrument
                    </span>
                  ) : (
                    m.instruments.map((i) => (
                      <span
                        key={i}
                        className="rounded bg-secondary px-2 py-0.5 text-xs"
                      >
                        {i}
                      </span>
                    ))
                  )}
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive"
                onClick={() => remove(m)}
                aria-label="Șterge"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editează membru" : "Membru nou"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member-name">Nume</Label>
              <Input
                id="member-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Andrei"
                className="h-11"
              />
            </div>
            <div>
              <Label>Instrumente</Label>
              <div className="mt-2">
                <InstrumentPicker
                  value={instruments}
                  onChange={setInstruments}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="mr-1 h-4 w-4" /> Anulează
            </Button>
            <Button onClick={save} disabled={saving}>
              <Save className="mr-1 h-4 w-4" />
              {saving ? "Se salvează…" : "Salvează"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}