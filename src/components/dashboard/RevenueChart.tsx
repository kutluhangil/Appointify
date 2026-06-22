import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";

interface RevenueChartProps {
  data: Array<{ day: string; revenue: number }>;
  totalRevenue: number;
}

const revenueChartConfig: ChartConfig = {
  revenue: { label: "Gelir (₺)", color: "hsl(var(--foreground))" },
};

export function RevenueChart({ data, totalRevenue }: RevenueChartProps) {
  return (
    <div className="border border-border rounded-xl bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] font-medium">Haftalık Gelir</p>
          <p className="text-[11px] text-muted-foreground">Son 7 gün</p>
        </div>
        <span className="text-[20px] font-semibold">{formatCurrency(totalRevenue)}</span>
      </div>
      <ChartContainer config={revenueChartConfig} className="h-[180px] w-full">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="revenue" name="revenue" fill="hsl(var(--foreground))" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
