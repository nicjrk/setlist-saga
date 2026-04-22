import { Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBandMembers } from "@/hooks/useBandMembers";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

export function IntroStarterPicker({ value, onChange }: Props) {
  const { data: members } = useBandMembers();

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selected = (members ?? []).filter((m) => value.includes(m.id));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selected.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            Niciun membru selectat
          </span>
        ) : (
          selected.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary"
            >
              {m.name}
              {m.instruments.length > 0 && (
                <span className="text-xs font-normal text-primary/70">
                  · {m.instruments.join(", ")}
                </span>
              )}
            </span>
          ))
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <UserPlus className="mr-1 h-4 w-4" /> Alege cine începe
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-1">
          {(members?.length ?? 0) === 0 ? (
            <div className="space-y-2 p-3 text-center">
              <p className="text-sm text-muted-foreground">
                Nu există membri încă.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link to="/members">Adaugă membri</Link>
              </Button>
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {members!.map((m) => {
                const isOn = value.includes(m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => toggle(m.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-accent/50",
                        isOn && "bg-primary/10"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{m.name}</p>
                        {m.instruments.length > 0 && (
                          <p className="truncate text-xs text-muted-foreground">
                            {m.instruments.join(", ")}
                          </p>
                        )}
                      </div>
                      {isOn && (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}