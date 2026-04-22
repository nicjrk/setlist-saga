import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StructureBuilder } from "@/components/StructureBuilder";
import { PdfUploader } from "@/components/PdfUploader";
import { supabase } from "@/integrations/supabase/client";
import { useSong } from "@/hooks/useSongs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SongSection } from "@/types/song";

const empty = {
  title: "",
  musical_key: "",
  verses_count: 0,
  intro_info: "",
  notes: "",
  reference_url: "",
  pdf_url: null as string | null,
  pdf_path: null as string | null,
  structure: [] as SongSection[],
};

export default function SongEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: song, isLoading } = useSong(isNew ? undefined : id);

  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (song) {
      setForm({
        title: song.title,
        musical_key: song.musical_key ?? "",
        verses_count: song.verses_count ?? 0,
        intro_info: song.intro_info ?? "",
        notes: song.notes ?? "",
        reference_url: song.reference_url ?? "",
        pdf_url: song.pdf_url,
        pdf_path: song.pdf_path,
        structure: Array.isArray(song.structure) ? song.structure : [],
      });
    }
  }, [song]);

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        musical_key: form.musical_key.trim() || null,
        verses_count: Number(form.verses_count) || 0,
        intro_info: form.intro_info.trim() || null,
        notes: form.notes.trim() || null,
        reference_url: form.reference_url.trim() || null,
        pdf_url: form.pdf_url,
        pdf_path: form.pdf_path,
        structure: form.structure as unknown as object,
      };
      if (isNew) {
        const { data, error } = await supabase
          .from("songs")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        toast.success("Song created");
        qc.invalidateQueries({ queryKey: ["songs"] });
        navigate(`/songs/${data.id}`);
      } else {
        const { error } = await supabase
          .from("songs")
          .update(payload)
          .eq("id", id!);
        if (error) throw error;
        toast.success("Saved");
        qc.invalidateQueries({ queryKey: ["songs"] });
        qc.invalidateQueries({ queryKey: ["song", id] });
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
    if (!confirm("Delete this song?")) return;
    if (form.pdf_path) {
      await supabase.storage.from("sheet-music").remove([form.pdf_path]);
    }
    const { error } = await supabase.from("songs").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Song deleted");
    qc.invalidateQueries({ queryKey: ["songs"] });
    navigate("/");
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
        <h1 className="text-lg font-bold">{isNew ? "New Song" : "Edit Song"}</h1>
        <div className="w-[60px]" />
      </div>

      <Card className="space-y-4 p-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Song title"
            className="h-11"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="key">Musical Key</Label>
            <Input
              id="key"
              value={form.musical_key}
              onChange={(e) =>
                setForm({ ...form, musical_key: e.target.value })
              }
              placeholder="e.g. Am, G#"
              className="h-11 font-bold uppercase"
            />
          </div>
          <div>
            <Label htmlFor="verses">Verses</Label>
            <Input
              id="verses"
              type="number"
              min={0}
              value={form.verses_count}
              onChange={(e) =>
                setForm({ ...form, verses_count: Number(e.target.value) })
              }
              className="h-11"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="intro">Intro Info</Label>
          <Input
            id="intro"
            value={form.intro_info}
            onChange={(e) => setForm({ ...form, intro_info: e.target.value })}
            placeholder="e.g. 4 bars of guitar arpeggio"
            className="h-11"
          />
        </div>
        <div>
          <Label htmlFor="notes">General Notes</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Anything to remember…"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="ref">Reference Link (YouTube/Spotify)</Label>
          <Input
            id="ref"
            value={form.reference_url}
            onChange={(e) =>
              setForm({ ...form, reference_url: e.target.value })
            }
            placeholder="https://…"
            className="h-11"
            type="url"
          />
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <h2 className="text-base font-bold">Structure</h2>
        <StructureBuilder
          sections={form.structure}
          onChange={(structure) => setForm({ ...form, structure })}
        />
      </Card>

      <Card className="space-y-3 p-4">
        <h2 className="text-base font-bold">Sheet Music</h2>
        <PdfUploader
          pdfUrl={form.pdf_url}
          pdfPath={form.pdf_path}
          onChange={(d) => setForm({ ...form, ...d })}
        />
      </Card>

      <div className="sticky bottom-20 flex gap-2">
        <Button
          onClick={save}
          disabled={saving}
          size="lg"
          className="h-12 flex-1 text-base font-bold shadow-lg"
        >
          <Save className="mr-2 h-5 w-5" />
          {saving ? "Saving…" : "Save Song"}
        </Button>
        {!isNew && (
          <Button
            variant="outline"
            size="lg"
            className="h-12 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={remove}
            aria-label="Delete song"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Separator className="opacity-0" />
    </section>
  );
}