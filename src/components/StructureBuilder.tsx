import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SECTION_TYPES,
  SECTION_COLOR,
  type SongSection,
  type SectionType,
} from "@/types/song";
import { cn } from "@/lib/utils";

interface Props {
  sections: SongSection[];
  onChange: (sections: SongSection[]) => void;
}

function SortableItem({
  section,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
}: {
  section: SongSection;
  index: number;
  total: number;
  onUpdate: (cue: string) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-stretch gap-2 rounded-lg border border-border bg-card p-2"
    >
      <button
        type="button"
        className="flex cursor-grab touch-none items-center px-1 text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
              SECTION_COLOR[section.type]
            )}
          >
            {section.type}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={index === 0}
              onClick={() => onMove(-1)}
              aria-label="Move up"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={index === total - 1}
              onClick={() => onMove(1)}
              aria-label="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onRemove}
              aria-label="Remove section"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Input
          value={section.cue}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Cue (e.g. Drum start, Keyboard only)"
          className="h-9"
        />
      </div>
    </div>
  );
}

export function StructureBuilder({ sections, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addSection = (type: SectionType) => {
    onChange([
      ...sections,
      { id: crypto.randomUUID(), type, cue: "" },
    ]);
  };

  const updateCue = (id: string, cue: string) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, cue } : s)));
  };

  const removeSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id));
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const next = arrayMove(sections, index, index + dir);
    onChange(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    onChange(arrayMove(sections, oldIndex, newIndex));
  };

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sections.map((section, index) => (
              <SortableItem
                key={section.id}
                section={section}
                index={index}
                total={sections.length}
                onUpdate={(cue) => updateCue(section.id, cue)}
                onRemove={() => removeSection(section.id)}
                onMove={(dir) => moveSection(index, dir)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground">
          No sections yet. Add an Intro, Verse, Chorus…
        </p>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {SECTION_TYPES.map((type) => (
            <DropdownMenuItem
              key={type}
              onClick={() => addSection(type)}
              className="font-medium"
            >
              <span
                className={cn(
                  "mr-2 inline-block h-2.5 w-2.5 rounded-full",
                  `bg-section-${type.toLowerCase()}`
                )}
              />
              {type}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}