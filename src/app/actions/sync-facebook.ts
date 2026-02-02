"use server";

import { auth } from "@clerk/nextjs/server";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import prisma from "@/lib/prisma";
import { syncFacebookData } from "./facebook";

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
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return { success: false, error: "Не авторизован" };
    }

    console.log("🚀 Starting Facebook sync for user:", clerkUserId);

    // Find user in database by clerk_id
    const dbUser = await prisma.users.findUnique({
      where: { clerk_id: clerkUserId },
    });

    if (!dbUser) {
      console.error("❌ User not found in database for clerk_id:", clerkUserId);
      return { success: false, error: "Пользователь не найден в базе данных" };
    }

    console.log("✅ Found user in database:", dbUser.id);
    console.log("📊 User details:", {
      id: dbUser.id,
      email: dbUser.email,
      clerk_id: dbUser.clerk_id,
    });

    // Use local sync function instead of Trigger.dev task
    const result = await syncFacebookData();

    console.log("✅ Sync completed:", result);

    return {
      success: result.success,
      syncedCount: result.campaignCount,
      error: result.error,
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
  error?: any;
}> {
  try {
    const run = await runs.retrieve(runId);
    
    console.log("📊 Run details:", {
      id: run.id,
      status: run.status,
      output: run.output,
      error: run.error,
    });
    
    return {
      status: run.status as any,
      output: run.output,
      error: run.error,
    };
  } catch (error) {
    console.error("Error checking sync status:", error);
    return { status: "FAILED", error: error instanceof Error ? error.message : "Unknown error" };
  }
}
