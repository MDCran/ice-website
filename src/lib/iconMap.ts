import {
  Cloud,
  Shield,
  Lock,
  Server,
  Factory,
  Landmark,
  HeartPulse,
  Scale,
  Award,
  Clock,
  Users,
  Zap,
  CheckCircle,
  Database,
  Globe,
  Cpu,
  ArrowRight,
  Building2,
  Layers,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Monitor,
  HardDrive,
  Wifi,
  Eye,
  RefreshCw,
  RefreshCcw,
  Settings,
  FileText,
  BarChart3,
  ShieldAlert,
  Radar,
  Crosshair,
  Bug,
  Workflow,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Cloud,
  Shield,
  Lock,
  Server,
  Factory,
  Landmark,
  HeartPulse,
  Scale,
  Award,
  Clock,
  Users,
  Zap,
  CheckCircle,
  Database,
  Globe,
  Cpu,
  ArrowRight,
  Building2,
  Layers,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Monitor,
  HardDrive,
  Wifi,
  Eye,
  RefreshCw,
  RefreshCcw,
  Settings,
  FileText,
  BarChart3,
  ShieldAlert,
  Radar,
  Crosshair,
  Bug,
  Workflow,
};

/**
 * Resolve an icon name string (e.g. "Cloud") to a Lucide icon component.
 * Falls back to Globe if not found.
 */
export function resolveIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Globe;
  return ICON_MAP[name] ?? Globe;
}

/**
 * Get all available icon names for admin UI pickers.
 */
export function getIconNames(): string[] {
  return Object.keys(ICON_MAP);
}
