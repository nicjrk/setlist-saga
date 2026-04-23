import { useRef, useState } from "react";
import { Upload, FileText, Image as ImageIcon, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  pdfUrl: string | null;
  pdfPath: string | null;
  onChange: (data: { pdf_url: string | null; pdf_path: string | null }) => void;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

const isImage = (url: string | null) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|heic|heif)(\?|$)/i.test(url);
};

export function PdfUploader({ pdfUrl, pdfPath, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    const isPdf = file.type === "application/pdf";
    const isImg = file.type.startsWith("image/");
    if (!isPdf && !isImg) {
      toast.error("Please upload a PDF or image file");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("sheet-music")
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage
        .from("sheet-music")
        .getPublicUrl(path);

      // Remove previous file if any
      if (pdfPath) {
        await supabase.storage.from("sheet-music").remove([pdfPath]);
      }

      onChange({ pdf_url: pub.publicUrl, pdf_path: path });
      toast.success("Sheet music uploaded");
    } catch (e) {
      console.error(e);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removePdf = async () => {
    if (pdfPath) {
      await supabase.storage.from("sheet-music").remove([pdfPath]);
    }
    onChange({ pdf_url: null, pdf_path: null });
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {pdfUrl ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-sm">
              {isImage(pdfUrl) ? (
                <ImageIcon className="h-5 w-5 text-primary" />
              ) : (
                <FileText className="h-5 w-5 text-primary" />
              )}
              <span className="font-medium">
                {isImage(pdfUrl) ? "Image attached" : "Sheet music attached"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <a href={pdfUrl} target="_blank" rel="noreferrer" aria-label="Open file">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={removePdf}
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {isImage(pdfUrl) && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-lg border border-border bg-card"
            >
              <img
                src={pdfUrl}
                alt="Sheet music preview"
                className="max-h-64 w-full object-contain"
                loading="lazy"
              />
            </a>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading…" : "Upload Sheet Music (PDF or Image)"}
        </Button>
      )}
    </div>
  );
}