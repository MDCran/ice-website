import type { FC } from "react";
import {
  ActivityHeart,
  AlertOctagon,
  ArrowRight,
  Award01,
  Bank,
  BarChart03,
  Building02,
  Building07,
  CheckCircle,
  Clock,
  Cloud01,
  CpuChip01,
  Database01,
  Dataflow01,
  Eye,
  File02,
  Globe01,
  HardDrive,
  LayersThree01,
  Lock01,
  Mail01,
  MarkerPin02,
  Monitor01,
  Phone01,
  RefreshCcw01,
  RefreshCw01,
  Scales01,
  Scan,
  Server01,
  Settings01,
  Shield01,
  ShieldTick,
  ShieldZap,
  Target04,
  Users01,
  Wifi,
  Zap,
} from "@untitledui/icons";

/** A resolved icon component. Accepts a `className` for sizing/coloring. */
export type IconComponent = FC<{ className?: string }>;

const ICON_MAP: Record<string, IconComponent> = {
  Cloud: Cloud01,
  Shield: Shield01,
  Lock: Lock01,
  Server: Server01,
  Factory: Building07,
  Landmark: Bank,
  HeartPulse: ActivityHeart,
  Scale: Scales01,
  Award: Award01,
  Clock: Clock,
  Users: Users01,
  Zap: Zap,
  CheckCircle: CheckCircle,
  Database: Database01,
  Globe: Globe01,
  Cpu: CpuChip01,
  ArrowRight: ArrowRight,
  Building2: Building02,
  Layers: LayersThree01,
  ShieldCheck: ShieldTick,
  MapPin: MarkerPin02,
  Mail: Mail01,
  Phone: Phone01,
  Monitor: Monitor01,
  HardDrive: HardDrive,
  Wifi: Wifi,
  Eye: Eye,
  RefreshCw: RefreshCw01,
  RefreshCcw: RefreshCcw01,
  Settings: Settings01,
  FileText: File02,
  BarChart3: BarChart03,
  ShieldAlert: ShieldZap,
  Radar: Scan,
  Crosshair: Target04,
  Bug: AlertOctagon,
  Workflow: Dataflow01,
};

/**
 * Resolve an icon name string (e.g. "Cloud") to an Untitled UI icon component.
 * Falls back to Globe01 if not found.
 */
export function resolveIcon(name: string | null | undefined): IconComponent {
  if (!name) return Globe01;
  return ICON_MAP[name] ?? Globe01;
}

/**
 * Get all available icon names for admin UI pickers.
 */
export function getIconNames(): string[] {
  return Object.keys(ICON_MAP);
}
