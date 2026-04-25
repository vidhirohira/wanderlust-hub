// Map seeded image_url paths to imported assets so Vite resolves them correctly.
import taj from "@/assets/dest-taj.jpg";
import kerala from "@/assets/dest-kerala.jpg";
import jaisalmer from "@/assets/dest-jaisalmer.jpg";
import goa from "@/assets/dest-goa.jpg";
import ladakh from "@/assets/dest-ladakh.jpg";
import hampi from "@/assets/dest-hampi.jpg";
import corbett from "@/assets/dest-corbett.jpg";
import varanasi from "@/assets/dest-varanasi.jpg";

const map: Record<string, string> = {
  "/src/assets/dest-taj.jpg": taj,
  "/src/assets/dest-kerala.jpg": kerala,
  "/src/assets/dest-jaisalmer.jpg": jaisalmer,
  "/src/assets/dest-goa.jpg": goa,
  "/src/assets/dest-ladakh.jpg": ladakh,
  "/src/assets/dest-hampi.jpg": ladakh,
  "/src/assets/dest-hampi.jpg ": hampi,
};

// rebuild the map cleanly
const IMAGES: Record<string, string> = {
  "/src/assets/dest-taj.jpg": taj,
  "/src/assets/dest-kerala.jpg": kerala,
  "/src/assets/dest-jaisalmer.jpg": jaisalmer,
  "/src/assets/dest-goa.jpg": goa,
  "/src/assets/dest-ladakh.jpg": ladakh,
  "/src/assets/dest-hampi.jpg": hampi,
  "/src/assets/dest-corbett.jpg": corbett,
  "/src/assets/dest-varanasi.jpg": varanasi,
};

const FALLBACK = taj;

export function resolveImage(src: string | null | undefined): string {
  if (!src) return FALLBACK;
  if (src.startsWith("http") || src.startsWith("blob:") || src.startsWith("data:")) return src;
  return IMAGES[src] ?? FALLBACK;
}

export const DESTINATION_IMAGE_OPTIONS = Object.keys(IMAGES);
