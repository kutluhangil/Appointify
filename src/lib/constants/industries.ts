import { Scissors, Sparkles, Salad, Stethoscope, PenTool, Dumbbell, Flower2, Brush } from "lucide-react";

export type IndustryId =
  | "barber"
  | "tattoo"
  | "dietitian"
  | "beauty"
  | "physio"
  | "fitness"
  | "spa"
  | "other";

export const INDUSTRIES: Array<{
  id: IndustryId;
  icon: typeof Scissors;
  i18nKey: string;
}> = [
  { id: "barber", icon: Scissors, i18nKey: "industry.barber" },
  { id: "tattoo", icon: PenTool, i18nKey: "industry.tattoo" },
  { id: "dietitian", icon: Salad, i18nKey: "industry.dietitian" },
  { id: "beauty", icon: Brush, i18nKey: "industry.beauty" },
  { id: "physio", icon: Stethoscope, i18nKey: "industry.physio" },
  { id: "fitness", icon: Dumbbell, i18nKey: "industry.fitness" },
  { id: "spa", icon: Flower2, i18nKey: "industry.spa" },
  { id: "other", icon: Sparkles, i18nKey: "industry.other" },
];
