"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle, XCircle, Facebook } from "lucide-react";
import { triggerFacebookSync, checkSyncStatus, SyncResult } from "@/app/actions/sync-facebook";

type SyncStatus = "idle" | "triggering" | "processing" | "completed" | "failed";

export function FacebookSyncButton() {
  const router = useRouter();
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [runId, setRunId] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Polling for task status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max

    if (runId && status === "processing") {
      interval = setInterval(async () => {
        attempts++;

        if (attempts > maxAttempts) {
          setStatus("failed");
          setError("Timeout - синхронизация заняла слишком много времени");
          clearInterval(interval);
          return;
        }

        try {
          const taskStatus = await checkSyncStatus(runId);
          console.log(`🔄 Checking status (attempt ${attempts}):`, taskStatus.status);

          if (taskStatus.status === "COMPLETED") {
            setStatus("completed");
            setResult({
              success: true,
              ...taskStatus.output,
            });
            clearInterval(interval);
            // Refresh the page to show new data
            router.refresh();
          } else if (taskStatus.status === "FAILED") {
            setStatus("failed");
            setError("Ошибка синхронизации с Facebook");
            clearInterval(interval);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [runId, status, router]);

  const handleSync = useCallback(async () => {
    setStatus("triggering");
    setError(null);
    setResult(null);

    try {
      const response = await triggerFacebookSync();

      if (response.success && response.runId) {
        setRunId(response.runId);
        setStatus("processing");
        console.log("✅ Task started, waiting for completion...");
      } else {
        setStatus("failed");
        setError(response.error || "Не удалось запустить синхронизацию");
      }
    } catch (e) {
      console.error("Sync error:", e);
      setStatus("failed");
      setError(e instanceof Error ? e.message : "Ошибка сети");
    }
  }, []);

  // Auto-reset status after showing result
  useEffect(() => {
    if (status === "completed" || status === "failed") {
      const timeout = setTimeout(() => {
        setStatus("idle");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  const isLoading = status === "triggering" || status === "processing";

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
            Запуск...
          </>
        )}
        {status === "processing" && (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Синхронизация с FB...
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
          +{result.createdCount || 0} новых, {result.updatedCount || 0} обновлено
        </span>
      )}

      {/* Error message */}
      {status === "failed" && error && (
        <span className="text-sm text-red-600 animate-fade-in">{error}</span>
      )}
    </div>
  );
}
