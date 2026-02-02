"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Facebook } from "lucide-react";
import { triggerFacebookSync, SyncResult } from "@/app/actions/sync-facebook";

type SyncStatus = "idle" | "triggering" | "completed" | "failed";

export function FacebookSyncButton() {
  const router = useRouter();
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = useCallback(async () => {
    setStatus("triggering");
    setError(null);
    setResult(null);

    try {
      const response = await triggerFacebookSync();

      if (response.success) {
        setStatus("completed");
        setResult(response);
        console.log("✅ Sync completed:", response);
        // Refresh the page to show new data
        router.refresh();
      } else {
        setStatus("failed");
        setError(response.error || "Не удалось запустить синхронизацию");
      }
    } catch (e) {
      console.error("Sync error:", e);
      setStatus("failed");
      setError(e instanceof Error ? e.message : "Ошибка сети");
    }
  }, [router]);

  // Auto-reset status after showing result
  useEffect(() => {
    if (status === "completed" || status === "failed") {
      const timeout = setTimeout(() => {
        setStatus("idle");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  const isLoading = status === "triggering";

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleSync}
        disabled={isLoading}
        variant={status === "completed" ? "outline" : "default"}
        className={`
          transition-all duration-300
          ${status === "completed" ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100" : ""}
          ${status === "failed" ? "bg-red-50 border-red-300 text-red-700 hover:bg-red-100" : ""}
          ${isLoading ? "bg-blue-600" : ""}
        `}
      >
        {status === "idle" && (
          <>
            <Facebook className="w-4 h-4 mr-2" />
            Синхронизировать с FB
          </>
        )}
        {status === "triggering" && (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Синхронизация...
          </>
        )}
        {status === "completed" && (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Синхронизировано!
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="w-4 h-4 mr-2" />
            Ошибка
          </>
        )}
      </Button>

      {/* Result info */}
      {status === "completed" && result && (
        <span className="text-sm text-green-600 animate-fade-in">
          {result.syncedCount || 0} кампаний синхронизировано
        </span>
      )}

      {/* Error message */}
      {status === "failed" && error && (
        <span className="text-sm text-red-600 animate-fade-in">{error}</span>
      )}
    </div>
  );
}
