"use server";

import { auth } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk/v3";

export interface SyncResult {
  success: boolean;
  syncedCount?: number;
  createdCount?: number;
  updatedCount?: number;
  error?: string;
  runId?: string;
}

export async function triggerFacebookSync(): Promise<SyncResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Не авторизован" };
    }

    console.log("🚀 Triggering facebook-sync-demo for user:", userId);

    // Trigger the Trigger.dev task
    const handle = await tasks.trigger("facebook-sync-demo", {
      userId,
    });

    console.log("✅ Task triggered, run ID:", handle.id);

    return {
      success: true,
      runId: handle.id,
    };
  } catch (error) {
    console.error("❌ Error triggering Facebook sync:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ошибка синхронизации",
    };
  }
}

// Polling endpoint to check task status
export async function checkSyncStatus(runId: string): Promise<{
  status: "PENDING" | "EXECUTING" | "COMPLETED" | "FAILED";
  output?: any;
}> {
  try {
    const run = await tasks.retrieve(runId);
    
    return {
      status: run.status as any,
      output: run.output,
    };
  } catch (error) {
    console.error("Error checking sync status:", error);
    return { status: "FAILED" };
  }
}
