import { Tables } from "@/integrations/supabase/types";
import { formatCurrency, formatRelative } from "@/lib/format";
import { useTranslation } from "react-i18next";

type Customer = Tables<"customers">;

interface CustomersListProps {
  customers: Customer[];
  onSelect: (id: string) => void;
  statsMap: Record<string, { visits: number; spent: number; noShows: number; lastVisit: string | null }>;
}

const TAG_COLORS: Record<string, string> = {
  VIP:     "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  regular: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  new:     "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
};

export function CustomersList({
  customers,
  onSelect,
  statsMap,
}: CustomersListProps) {
  const { t } = useTranslation();

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("customers.name")}</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px] hidden md:table-cell">{t("customers.contact")}</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("customers.visits")}</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px] hidden md:table-cell">{t("customers.spent")}</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px] hidden md:table-cell">{t("customers.last_visit")}</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("customers.tag")}</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-muted-foreground text-[13px]">
                {t("customers.not_found")}
              </td>
            </tr>
          ) : (
            customers.map((c) => {
              const stats = statsMap[c.id] || { visits: 0, spent: 0, noShows: 0, lastVisit: null };
              const tag = c.tag || "regular";
              return (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => onSelect(c.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">
                        {c.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium">{c.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    <p className="text-[12px]">{c.phone || t("common.no_phone", { defaultValue: "Telefon yok" })}</p>
                    <p className="text-[11px]">{c.email || t("common.no_email", { defaultValue: "E-posta yok" })}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{stats.visits}</span>
                      {stats.noShows > 0 && (
                        <span className="text-[10px] text-orange-500 ml-1">
                          ({t("customers.no_shows_count", { count: stats.noShows, defaultValue: `${stats.noShows} gelmedi` })})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium hidden md:table-cell">{formatCurrency(stats.spent)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-[12px] hidden md:table-cell">
                    {stats.lastVisit ? formatRelative(stats.lastVisit) : t("customers.no_visits")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${TAG_COLORS[tag] || "bg-muted text-muted-foreground border-border"}`}>
                        {tag === "VIP" ? "⭐ VIP" : tag === "new" ? t("customers.new_tag") : t("customers.regular_tag")}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
