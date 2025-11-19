/**
 * LoadingScreen Component
 *
 * Full-Page Loading Screen
 */

import { LoadingSpinner } from "./loading-spinner";

export interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Wird geladen..." }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
