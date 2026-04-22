import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { PRESET_INSTRUMENTS } from "@/types/song";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

export function InstrumentPicker({ value, onChange }: Props) {
  const [custom, setCustom] = useState("");

  const add = (name: string) => {
    const t = name.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
  };

  const remove = (name: string) => {
    onChange(value.filter((v) => v !== name));
  };

  const available = PRESET_INSTRUMENTS.filter((p) => !value.includes(p));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.length === 0 && (
          <span className="text-sm text-muted-foreground">
            Niciun instrument adăugat.
          </span>
        )}
        {value.map((inst) => (
          <span
            key={inst}
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary"
          >
            {inst}
            <button
              type="button"
              onClick={() => remove(inst)}
              aria-label={`Remove ${inst}`}
              className="rounded p-0.5 hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <Plus className="mr-1 h-4 w-4" /> Adaugă instrument
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Alege din listă</DropdownMenuLabel>
          {available.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Toate instrumentele predefinite sunt adăugate.
            </div>
          ) : (
            available.map((inst) => (
              <DropdownMenuItem key={inst} onClick={() => add(inst)}>
                {inst}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Personalizat</DropdownMenuLabel>
          <div className="flex items-center gap-1 p-1">
            <Input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="ex: Ukulele"
              className="h-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add(custom);
                  setCustom("");
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={() => {
                add(custom);
                setCustom("");
              }}
              aria-label="Add custom instrument"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}