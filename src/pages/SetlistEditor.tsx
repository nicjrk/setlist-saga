import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSongs } from "@/hooks/useSongs";
import { useSetlist } from "@/hooks/useSetlists";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SetlistEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: setlist, isLoading } = useSetlist(isNew ? undefined : id);
  const { data: songs } = useSongs();

  const [name, setName] = useState("");
  const [songIds, setSongIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (setlist) {
      setName(setlist.name);
      setSongIds(Array.isArray(setlist.song_ids) ? setlist.song_ids : []);
    }
  }, [setlist]);

  const songMap = useMemo(() => {
    const m = new Map<string, (typeof songs)[number]>();
    songs?.forEach((s) => m.set(s.id, s));
    return m;
  }, [songs]);

  const availableSongs = useMemo(
    () => songs?.filter((s) => !songIds.includes(s.id)) ?? [],
    [songs, songIds]
  );

  const move = (i: number, dir: -1 | 1) => {
    const next = [...songIds];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setSongIds(next);
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        song_ids: songIds as unknown as never,
      };
      if (isNew) {
        const { data, error } = await supabase
          .from("setlists")
          .insert(payload as never)
          .select("id")
          .single();
        if (error) throw error;
        toast.success("Setlist created");
        qc.invalidateQueries({ queryKey: ["setlists"] });
        navigate(`/setlists/${data.id}`);
      } else {
        const { error } = await supabase
          .from("setlists")
          .update(payload as never)
          .eq("id", id!);
        if (error) throw error;
        toast.success("Saved");
        qc.invalidateQueries({ queryKey: ["setlists"] });
        qc.invalidateQueries({ queryKey: ["setlist", id] });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id || isNew) return;
    if (!confirm("Delete this setlist?")) return;
    const { error } = await supabase.from("setlists").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    qc.invalidateQueries({ queryKey: ["setlists"] });
    navigate("/setlists");
  };

  if (!isNew && isLoading) {
    return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <h1 className="text-lg font-bold">
          {isNew ? "New Setlist" : "Edit Setlist"}
        </h1>
        {!isNew ? (
          <Button asChild size="sm" variant="outline">
            <a href={`/stage/${id}`}>
              <Play className="mr-1 h-4 w-4" /> Stage
            </a>
          </Button>
        ) : (
          <div className="w-[80px]" />
        )}
      </div>

      <Card className="space-y-3 p-4">
        <Label htmlFor="name">Setlist Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Saturday at the Blue Note"
          className="h-11"
        />
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Songs</h2>
          <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add songs</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                {availableSongs.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No more songs available.
                  </p>
                )}
                {availableSongs.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSongIds([...songIds, s.id]);
                    }}
                    className="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-left hover:border-primary/50"
                  >
                    <div>
                      <p className="font-medium">{s.title}</p>
                      {s.musical_key && (
                        <p className="text-xs text-primary">{s.musical_key}</p>
                      )}
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {songIds.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground">
            Add songs from your repertoire.
          </p>
        ) : (
          <ol className="space-y-2">
            {songIds.map((sid, i) => {
              const s = songMap.get(sid);
              return (
                <li
                  key={sid}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
                >
                  <span className="w-6 text-center font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">
                      {s?.title ?? "Unknown song"}
                    </p>
                    {s?.musical_key && (
                      <p className="text-xs text-primary">{s.musical_key}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={i === songIds.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() =>
                      setSongIds(songIds.filter((x) => x !== sid))
                    }
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <div className="sticky bottom-20 flex gap-2">
        <Button
          onClick={save}
          disabled={saving}
          size="lg"
          className="h-12 flex-1 text-base font-bold shadow-lg"
        >
          <Save className="mr-2 h-5 w-5" />
          {saving ? "Saving…" : "Save Setlist"}
        </Button>
        {!isNew && (
          <Button
            variant="outline"
            size="lg"
            className="h-12 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={remove}
            aria-label="Delete setlist"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
    </section>
  );
}