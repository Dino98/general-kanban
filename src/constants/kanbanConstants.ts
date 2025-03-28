
import { InvestorStatus } from "@/utils/excelParser";

export const COLUMN_COLORS = [
  "rgba(255, 235, 235, 0.8)", // Da contattare
  "rgba(255, 238, 221, 0.8)", // Contattati
  "rgba(255, 248, 204, 0.8)", // Interessati
  "rgba(229, 253, 209, 0.8)", // Negoziazione
  "rgba(212, 244, 221, 0.8)", // A bordo!
  "rgba(247, 212, 212, 0.8)", // Drop definitivo
];

export const INVESTOR_STATUSES: InvestorStatus[] = [
  "Da contattare",
  "Contattati",
  "Interessati",
  "Negoziazione",
  "A bordo!",
  "Drop definitivo",
];
