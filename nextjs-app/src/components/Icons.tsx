/**
 * shadcn/ui 风格图标 — 统一使用 lucide-react 官方包。
 * 所有图标以 re-export 方式集中管理，方便全局查找和替换。
 *
 * 使用方式：import { IconBack, IconMenu } from "@/components/Icons";
 * 等价于直接从 lucide-react 导入，但名称与项目约定保持一致。
 */

export {
  // ---- App Bar / Navigation ----
  AlignLeft as IconMenu,
  Ellipsis as IconMore,
  ChevronLeft as IconBack,
  ChevronDown as IconChevronDown,
  ChevronRight as IconChevronRight,
  X as IconX,
  Check as IconCheck,
  Pencil as IconPencil,
  Plus as IconPlus,

  // ---- Composer ----
  Mic as IconMic,
  Camera as IconCamera,
  SendHorizontal as IconSend,

  // ---- Travel Modes ----
  Plane as IconPlane,
  Ship as IconShip,
  Car as IconCar,
  Footprints as IconWalk,

  // ---- Status ----
  Zap as IconZap,
  Flag as IconFlag,
  Notebook as IconNotebook,

  // ---- Family / Transit ----
  Baby as IconBaby,
  ShoppingCart as IconStroller,
  PlayCircle as IconPlay,
  Eye as IconCalm,
  Info as IconInfo,
  Clock as IconClock,
  Ticket as IconTicket,
  AlertTriangle as IconAlert,

  // ---- Perks (服务权益) ----
  Timer as IconDelay,
  Navigation as IconNavigate,
  CarTaxiFront as IconTaxi,
  ShieldCheck as IconShield,
  Gift as IconGift,
} from "lucide-react";
