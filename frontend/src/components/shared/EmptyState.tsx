import type { TablerIcon } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: TablerIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-center px-4">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="text-muted-foreground" size={32} />
        </div>
      )}
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}