export function typeColorClasses(type: string): string {
  const t = type.toLowerCase();
  switch (t) {
    case "heritage":
      return "bg-type-heritage/15 text-type-heritage border-type-heritage/30";
    case "nature":
      return "bg-type-nature/15 text-type-nature border-type-nature/30";
    case "beach":
      return "bg-type-beach/15 text-type-beach border-type-beach/30";
    case "adventure":
      return "bg-type-adventure/15 text-type-adventure border-type-adventure/30";
    case "wildlife":
      return "bg-type-wildlife/15 text-type-wildlife border-type-wildlife/30";
    case "spiritual":
      return "bg-type-spiritual/15 text-type-spiritual border-type-spiritual/30";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
}

export function modeColorClasses(mode: string): string {
  switch (mode.toLowerCase()) {
    case "train":
      return "bg-type-heritage/15 text-type-heritage";
    case "bus":
      return "bg-type-nature/15 text-type-nature";
    case "flight":
      return "bg-type-beach/15 text-type-beach";
    case "taxi":
      return "bg-type-adventure/15 text-type-adventure";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}
