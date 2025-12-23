import { Card } from "@/components/ui/card";
import type { TablerIcon } from "@tabler/icons-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: TablerIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  description,
}: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {label}
          </p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                from last period
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon size={24} className="text-primary" />
          </div>
        )}
      </div>
    </Card>
  );
}
