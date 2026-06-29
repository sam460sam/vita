// ============================================================================
// Lightweight icon-by-name resolver. Habits store a lucide icon name as a
// string; this maps the curated set actually used by the app to real
// components (avoids `import *` bundle bloat). Falls back to a sparkle.
// ============================================================================
import {
  Droplet,
  CigaretteOff,
  Footprints,
  BookOpen,
  Brain,
  Moon,
  Dumbbell,
  Apple,
  Activity,
  Heart,
  Flame,
  Coffee,
  Sun,
  Bike,
  Music,
  PenLine,
  Smile,
  Leaf,
  Sparkles,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

const REGISTRY: Record<string, LucideIcon> = {
  Droplet,
  CigaretteOff,
  Footprints,
  BookOpen,
  Brain,
  Moon,
  Dumbbell,
  Apple,
  Activity,
  Heart,
  Flame,
  Coffee,
  Sun,
  Bike,
  Music,
  PenLine,
  Smile,
  Leaf,
  Sparkles,
};

/** Render a lucide icon by its string name, with a graceful fallback. */
export function Icon({ name, ...props }: { name?: string } & LucideProps) {
  const Cmp = (name && REGISTRY[name]) || Sparkles;
  return <Cmp {...props} />;
}
