"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

interface FacebookAdAccount {
  id: string;
  account_id: string;
  name: string;
  account_status: number;
}

interface FacebookCampaign {
  id: string;
  name: string;
  status: string;
  effective_status: string;
}

interface FacebookInsight {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  clicks: string;
  impressions: string;
  cpc?: string;
  ctr?: string;
  actions?: Array<{ action_type: string; value: string }>;
}

interface ConnectFacebookResult {
  success: boolean;
  error?: string;
  accountId?: string;
  accountName?: string;
}

/**
 * Connects Facebook Ad Account to the user's profile.
 * 
 * @param token - Facebook Access Token (required)
 * @param accountId - Ad Account ID (optional - if not provided, fetches first available)
 * @returns Success/error result with account details
 */
export async function connectFacebook(
  token: string,
  accountId?: string
): Promise<ConnectFacebookResult> {
  // 1. Validate user is authenticated
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  // 2. Validate token is provided
  if (!token || token.trim() === "") {
    return { success: false, error: "Access Token is required." };
  }

  const cleanToken = token.trim();
  let finalAccountId = accountId?.trim() || "";
  let accountName = "";

  try {
    // SCENARIO A: Token + Account ID provided
    if (finalAccountId) {
      // Normalize account ID (add "act_" prefix if missing)
      if (!finalAccountId.startsWith("act_")) {
        finalAccountId = `act_${finalAccountId}`;
      }

      // Verify access to this specific account
      const verifyUrl = `https://graph.facebook.com/v19.0/${finalAccountId}?fields=name,account_status&access_token=${cleanToken}`;
      const verifyRes = await fetch(verifyUrl);
      const verifyJson = await verifyRes.json();

      if (verifyJson.error) {
        console.error("Facebook API Error:", verifyJson.error);
        return {
          success: false,
          error: verifyJson.error.message || "Invalid Token or Account ID",
        };
      }

      accountName = verifyJson.name || "Facebook Ad Account";
      
      // Check account status (1 = ACTIVE)
      if (verifyJson.account_status !== 1) {
        return {
          success: false,
          error: `Account "${accountName}" is not active (status: ${verifyJson.account_status})`,
        };
      }
    }
    // SCENARIO B: Only Token provided - fetch user's ad accounts
    else {
      const accountsUrl = `https://graph.facebook.com/v19.0/me/adaccounts?fields=account_id,name,account_status,amount_spent,currency,business_name&access_token=${cleanToken}`;
      const accountsRes = await fetch(accountsUrl);
      const accountsJson = await accountsRes.json();

      if (accountsJson.error) {
        console.error("Facebook API Error:", accountsJson.error);
        return {
          success: false,
          error: accountsJson.error.message || "Invalid Token. Please check your access token.",
        };
      }

      const accounts: FacebookAdAccount[] = accountsJson.data || [];

      // 🧐 DEBUG: Log ALL accounts for user to see
      console.log("🧐 ========== CONNECT: ALL AD ACCOUNTS ==========");
      const accountsList = accounts.map((acc: any) => ({
        id: acc.id,
        account_id: acc.account_id,
        name: acc.name,
        status: acc.account_status,
        amount_spent: acc.amount_spent ? `$${(parseInt(acc.amount_spent) / 100).toFixed(2)}` : "$0.00",
        currency: acc.currency,
        business: acc.business_name || "Personal",
      }));
      console.log("🧐 Found Ad Accounts:", JSON.stringify(accountsList, null, 2));
      
      // Highlight accounts with spend
      const accountsWithSpend = accountsList.filter((acc: any) => acc.amount_spent !== "$0.00");
      if (accountsWithSpend.length > 0) {
        console.log("💰 RECOMMENDED - Accounts WITH SPEND:", JSON.stringify(accountsWithSpend, null, 2));
      }
      console.log("🧐 ==============================================");

      if (accounts.length === 0) {
        return {
          success: false,
          error: "No ad accounts found. Make sure your token has access to at least one ad account.",
        };
      }

      // SMART SELECTION: Prefer account with spend over empty account
      // First, try to find an ACTIVE account that has amount_spent > 0
      const accountWithSpendAndActive = accounts.find((acc: any) => 
        acc.account_status === 1 && acc.amount_spent && parseInt(acc.amount_spent) > 0
      );
      
      // Fall back to any ACTIVE account
      const activeAccount = accountWithSpendAndActive || accounts.find((acc) => acc.account_status === 1);

      if (!activeAccount) {
        return {
          success: false,
          error: "No active ad accounts found. All your accounts may be disabled.",
        };
      }

      finalAccountId = activeAccount.id; // Already has "act_" prefix from API
      accountName = activeAccount.name || "Facebook Ad Account";
      
      console.log(`✅ AUTO-SELECTED ACCOUNT: ${finalAccountId} (${accountName})`);
      if (accountWithSpendAndActive) {
        console.log("💰 This account has historical spend - good choice!");
      } else {
        console.log("⚠️ WARNING: Selected account may have $0 spend. If you have another account with data, provide its ID manually.");
      }
    }

    // 3. Get or create user in DB
    const clerkId = user.id;
    const email = user.emailAddresses[0]?.emailAddress ?? "";

    let dbUser = await prisma.users.findUnique({
      where: { clerk_id: clerkId },
    });

    if (!dbUser) {
      dbUser = await prisma.users.create({
        data: {
          id: randomUUID(),
          email: email,
          clerk_id: clerkId,
        },
      });
    }

    // 4. Save or update settings with Facebook token
    const existingSettings = await prisma.settings.findFirst({
      where: { user_id: dbUser.id },
    });

    if (existingSettings) {
      await prisma.settings.update({
        where: { id: existingSettings.id },
        data: {
          traffic_source: "facebook",
          traffic_source_api_key: cleanToken,
          updated_at: new Date(),
        },
      });
    } else {
      await prisma.settings.create({
        data: {
          user_id: dbUser.id,
          traffic_source: "facebook",
          traffic_source_api_key: cleanToken,
        },
      });
    }

    // 5. Create or update ad_account record
    // First, find or create a tenant for this user
    let tenant = await prisma.tenants.findFirst({
      where: { name: email },
    });

    if (!tenant) {
      tenant = await prisma.tenants.create({
        data: {
          name: email,
          plan: "trial",
        },
      });
    }

    // Check if ad account already exists
    const existingAdAccount = await prisma.ad_accounts.findFirst({
      where: {
        tenant_id: tenant.id,
        platform: "facebook",
        external_account_id: finalAccountId,
      },
    });

    if (!existingAdAccount) {
      await prisma.ad_accounts.create({
        data: {
          tenant_id: tenant.id,
          platform: "facebook",
          external_account_id: finalAccountId,
          status: "active",
        },
      });
    } else {
      // Update status if reconnecting
      await prisma.ad_accounts.update({
        where: { id: existingAdAccount.id },
        data: { status: "active", connected_at: new Date() },
      });
    }

    // 6. Also save to api_keys table for sync tasks (legacy support)
    await prisma.api_keys.upsert({
      where: { id: 1 }, // We'll use a simple approach - update or create first record
      create: {
        chat_id: BigInt(0), // No telegram chat - dashboard user
        api_key: cleanToken,
        platform: "facebook",
        ad_account_id: finalAccountId,
      },
      update: {
        api_key: cleanToken,
        ad_account_id: finalAccountId,
      },
    });

    // 7. Trigger initial sync to fetch campaign data
    console.log("🔄 Triggering initial Facebook data sync...");
    // Note: We don't await this - let it run in background
    // The user will see data after page refresh
    
    revalidatePath("/campaigns");
    revalidatePath("/");

    return {
      success: true,
      accountId: finalAccountId,
      accountName: accountName,
    };
  } catch (error) {
    console.error("Connect Facebook Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Fetches the user's connected Facebook account status
 */
export async function getFacebookConnectionStatus(): Promise<{
  isConnected: boolean;
  accountId?: string;
}> {
  const user = await currentUser();
  if (!user) {
    return { isConnected: false };
  }

  try {
    const dbUser = await prisma.users.findUnique({
      where: { clerk_id: user.id },
    });

    if (!dbUser) {
      return { isConnected: false };
    }

    const settings = await prisma.settings.findFirst({
      where: {
        user_id: dbUser.id,
        traffic_source: "facebook",
      },
    });

    if (settings?.traffic_source_api_key) {
      // Find the associated ad account
      const tenant = await prisma.tenants.findFirst({
        where: { name: dbUser.email },
      });

      if (tenant) {
        const adAccount = await prisma.ad_accounts.findFirst({
          where: {
            tenant_id: tenant.id,
            platform: "facebook",
            status: "active",
          },
        });

        return {
          isConnected: true,
          accountId: adAccount?.external_account_id,
        };
      }

      return { isConnected: true };
    }

    return { isConnected: false };
  } catch {
    return { isConnected: false };
  }
}

/**
 * Syncs Facebook campaign data to the database.
 * Fetches ALL campaigns (ACTIVE, PAUSED, ARCHIVED) with LIFETIME data.
 */
export async function syncFacebookData(): Promise<{
  success: boolean;
  campaignCount: number;
  error?: string;
}> {
  const user = await currentUser();
  if (!user) {
    return { success: false, campaignCount: 0, error: "Unauthorized" };
  }

  try {
    // 1. Get user and their Facebook token
    const dbUser = await prisma.users.findUnique({
      where: { clerk_id: user.id },
    });

    if (!dbUser) {
      return { success: false, campaignCount: 0, error: "User not found in database" };
    }

    const settings = await prisma.settings.findFirst({
      where: {
        user_id: dbUser.id,
        traffic_source: "facebook",
      },
    });

    if (!settings?.traffic_source_api_key) {
      return { success: false, campaignCount: 0, error: "Facebook not connected" };
    }

    const token = settings.traffic_source_api_key;

    // ========================================
    // 🧐 DEBUG: LOG ALL AVAILABLE AD ACCOUNTS
    // ========================================
    console.log("🧐 Fetching ALL ad accounts attached to this token...");
    const allAccountsUrl = `https://graph.facebook.com/v19.0/me/adaccounts?fields=name,account_id,account_status,amount_spent,currency,business_name&limit=100&access_token=${token}`;
    const allAccountsRes = await fetch(allAccountsUrl);
    const allAccountsJson = await allAccountsRes.json();
    
    // Initialize variables with default values
    let accountsList: any[] = [];
    let accountsWithSpend: any[] = [];
    
    if (allAccountsJson.data) {
      console.log("🧐 ========== ALL AD ACCOUNTS ==========");
      accountsList = allAccountsJson.data.map((acc: any) => ({
        id: acc.id,
        account_id: acc.account_id,
        name: acc.name,
        status: acc.account_status,
        amount_spent: acc.amount_spent ? `$${(parseInt(acc.amount_spent) / 100).toFixed(2)}` : "$0.00",
        currency: acc.currency,
        business: acc.business_name || "Personal",
      }));
      console.log("🧐 Found Ad Accounts:", JSON.stringify(accountsList, null, 2));
      
      // Log which accounts have spend
      accountsWithSpend = accountsList.filter((acc: any) => acc.amount_spent !== "$0.00");
      console.log(`🧐 Accounts with spend > $0: ${accountsWithSpend.length}`);
      if (accountsWithSpend.length > 0) {
        console.log("💰 Accounts WITH DATA:", JSON.stringify(accountsWithSpend, null, 2));
      }
      console.log("🧐 ========================================");
    } else {
      console.log("⚠️ Could not fetch ad accounts list:", allAccountsJson.error?.message || "Unknown error");
    }

    // 2. Find or create the tenant for this user
    let tenant = await prisma.tenants.findFirst({
      where: { name: dbUser.email },
    });

    if (!tenant) {
      // Create tenant if it doesn't exist
      tenant = await prisma.tenants.create({
        data: {
          name: dbUser.email,
          plan: "trial",
        },
      });
      console.log("✅ Created new tenant:", tenant.id);
    }

    // Find or create ad account
    let adAccount = await prisma.ad_accounts.findFirst({
      where: {
        tenant_id: tenant.id,
        platform: "facebook",
      },
    });

    if (!adAccount?.external_account_id) {
      // Create ad account if it doesn't exist
      // Use the first account with spend from the list
      const accountWithSpend = accountsWithSpend && accountsWithSpend.length > 0 ? accountsWithSpend[0] : accountsList[0];
      
      if (!accountWithSpend) {
        return { success: false, campaignCount: 0, error: "No ad accounts found" };
      }

      adAccount = await prisma.ad_accounts.create({
        data: {
          tenant_id: tenant.id,
          platform: "facebook",
          external_account_id: accountWithSpend.id,
          status: "active",
        },
      });
      console.log("✅ Created new ad account:", adAccount.id);
    }

    const accountId = adAccount.external_account_id;
    console.log(`🎯 USING AD ACCOUNT FROM DB: ${accountId}`);

    // 3. Fetch ALL campaigns (no effective_status filter!)
    const campaignsUrl = `https://graph.facebook.com/v19.0/${accountId}/campaigns?fields=id,name,status,effective_status&limit=500&access_token=${token}`;
    
    console.log("🔥 Fetching Facebook campaigns...");
    const campaignsRes = await fetch(campaignsUrl);
    const campaignsJson = await campaignsRes.json();

    if (campaignsJson.error) {
      console.error("❌ Facebook API Error:", campaignsJson.error);
      return { success: false, campaignCount: 0, error: campaignsJson.error.message };
    }

    const campaigns: FacebookCampaign[] = campaignsJson.data || [];
    console.log(`🔥 Facebook API Response Campaigns: ${campaigns.length}`);

    // 4. Fetch LIFETIME insights for all campaigns
    const insightsUrl = `https://graph.facebook.com/v19.0/${accountId}/insights?level=campaign&date_preset=maximum&fields=campaign_id,campaign_name,spend,clicks,impressions,cpc,ctr,actions&limit=500&access_token=${token}`;
    
    console.log("🔥 Fetching Facebook insights (LIFETIME)...");
    const insightsRes = await fetch(insightsUrl);
    const insightsJson = await insightsRes.json();

    const insights: FacebookInsight[] = insightsJson.data || [];
    console.log(`🔥 Facebook Insights count: ${insights.length}`);

    // Create a map for quick lookup
    const insightsMap = new Map<string, FacebookInsight>();
    for (const insight of insights) {
      insightsMap.set(insight.campaign_id, insight);
    }

    // Create a map for campaign names from insights
    const campaignNamesFromInsights = new Map<string, string>();
    for (const insight of insights) {
      campaignNamesFromInsights.set(insight.campaign_id, insight.campaign_name);
    }

    // 5. Upsert campaigns to database
    let syncedCount = 0;

    // First, process campaigns that have insights
    for (const insight of insights) {
      const campaignId = insight.campaign_id;
      const campaignName = insight.campaign_name;
      
      // Find the campaign in the campaigns list to get status
      const campaign = campaigns.find(c => c.id === campaignId);
      const status = campaign?.effective_status === "ACTIVE" ? "active" : 
                    campaign?.effective_status === "PAUSED" ? "paused" : "inactive";
      
      const spend = parseFloat(insight.spend) || 0;
      const clicks = parseInt(insight.clicks) || 0;
      const impressions = parseInt(insight.impressions) || 0;
      const cpc = insight?.cpc ? parseFloat(insight.cpc) : 0;
      const ctr = insight?.ctr ? parseFloat(insight.ctr) : 0;
      
      // Extract leads/conversions from actions
      let conversions = 0;
      if (insight?.actions) {
        const leadAction = insight.actions.find(a => a.action_type === "lead");
        const purchaseAction = insight.actions.find(a => a.action_type === "purchase");
        conversions = leadAction ? parseInt(leadAction.value) : (purchaseAction ? parseInt(purchaseAction.value) : 0);
      }

      // Calculate revenue estimate (for now, use spend * 1.5 as placeholder - adjust based on your payout model)
      const revenue = conversions > 0 ? conversions * 50 : spend * 1.2; // Estimate

      // Store metrics in JSON field (matching existing schema)
      const metricsJson = {
        external_id: campaignId,
        spend: spend,
        clicks: clicks,
        impressions: impressions,
        conversions: conversions,
        revenue: revenue,
        cpc: cpc,
        ctr: ctr,
        effective_status: campaign?.effective_status || "UNKNOWN",
      };

      console.log(`📊 Campaign "${campaignName}" metrics:`, JSON.stringify(metricsJson, null, 2));

      // Check if campaign exists by external_id in metrics JSON
      const existingCampaign = await prisma.campaigns.findFirst({
        where: {
          user_id: dbUser.id,
          platform: "facebook",
          metrics: {
            path: ["external_id"],
            equals: campaignId,
          },
        },
      });

      if (existingCampaign) {
        console.log(`🔄 Updating existing campaign: ${existingCampaign.id}`);
        // Update existing campaign
        await prisma.campaigns.update({
          where: { id: existingCampaign.id },
          data: {
            campaign_name: campaignName,
            status: status,
            metrics: metricsJson,
            updated_at: new Date(),
          },
        });
      } else {
        console.log(`➕ Creating new campaign: ${campaignName}`);
        // Create new campaign
        await prisma.campaigns.create({
          data: {
            user_id: dbUser.id,
            campaign_name: campaignName,
            platform: "facebook",
            status: status,
            metrics: metricsJson,
          },
        });
      }

      syncedCount++;
    }

    // Then, process campaigns that don't have insights (new campaigns)
    for (const campaign of campaigns) {
      // Skip if we already processed this campaign from insights
      if (insightsMap.has(campaign.id)) {
        continue;
      }
      
      const status = campaign.effective_status === "ACTIVE" ? "active" : 
                    campaign.effective_status === "PAUSED" ? "paused" : "inactive";

      // Store metrics in JSON field (matching existing schema)
      const metricsJson = {
        external_id: campaign.id,
        spend: 0,
        clicks: 0,
        impressions: 0,
        conversions: 0,
        revenue: 0,
        cpc: 0,
        ctr: 0,
        effective_status: campaign.effective_status,
      };

      console.log(`📊 Campaign "${campaign.name}" (no insights):`, JSON.stringify(metricsJson, null, 2));

      // Check if campaign exists by external_id in metrics JSON
      const existingCampaign = await prisma.campaigns.findFirst({
        where: {
          user_id: dbUser.id,
          platform: "facebook",
          metrics: {
            path: ["external_id"],
            equals: campaign.id,
          },
        },
      });

      if (existingCampaign) {
        console.log(`🔄 Updating existing campaign: ${existingCampaign.id}`);
        // Update existing campaign
        await prisma.campaigns.update({
          where: { id: existingCampaign.id },
          data: {
            campaign_name: campaign.name,
            status: status,
            metrics: metricsJson,
            updated_at: new Date(),
          },
        });
      } else {
        console.log(`➕ Creating new campaign: ${campaign.name}`);
        // Create new campaign
        await prisma.campaigns.create({
          data: {
            user_id: dbUser.id,
            campaign_name: campaign.name,
            platform: "facebook",
            status: status,
            metrics: metricsJson,
          },
        });
      }

      syncedCount++;
    }

    console.log(`✅ Synced ${syncedCount} campaigns to database`);

    // 6. Revalidate the campaigns page
    revalidatePath("/campaigns");
    revalidatePath("/");

    return { success: true, campaignCount: syncedCount };

  } catch (error) {
    console.error("Sync Facebook Error:", error);
    return {
      success: false,
      campaignCount: 0,
      error: error instanceof Error ? error.message : "Sync failed",
    };
  }
}