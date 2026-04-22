export type SectionType =
  | "Intro"
  | "Verse"
  | "Chorus"
  | "Bridge"
  | "Solo"
  | "Outro"
  | "Modulation";

export const SECTION_TYPES: SectionType[] = [
  "Intro",
  "Verse",
  "Chorus",
  "Bridge",
  "Solo",
  "Outro",
  "Modulation",
];

export interface SongSection {
  id: string;
  type: SectionType;
  cue: string;
}

export interface Song {
  id: string;
  title: string;
  musical_key: string | null;
  verses_count: number | null;
  intro_info: string | null;
  notes: string | null;
  structure: SongSection[];
  reference_url: string | null;
  pdf_url: string | null;
  pdf_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Setlist {
  id: string;
  name: string;
  song_ids: string[];
  created_at: string;
  updated_at: string;
}

export const SECTION_COLOR: Record<SectionType, string> = {
  Intro: "bg-section-intro/15 text-section-intro border-section-intro/30",
  Verse: "bg-section-verse/15 text-section-verse border-section-verse/30",
  Chorus: "bg-section-chorus/15 text-section-chorus border-section-chorus/30",
  Bridge: "bg-section-bridge/15 text-section-bridge border-section-bridge/30",
  Solo: "bg-section-solo/15 text-section-solo border-section-solo/30",
  Outro: "bg-section-outro/15 text-section-outro border-section-outro/30",
  Modulation:
    "bg-section-modulation/15 text-section-modulation border-section-modulation/30",
};