import { IconLoader2 } from "@tabler/icons-react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({ message = "Loading...", size = "md" }: LoadingStateProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <IconLoader2 className="animate-spin text-primary" size={sizeMap[size]} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}