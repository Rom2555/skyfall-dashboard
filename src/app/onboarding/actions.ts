"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";

export interface OnboardingFormData {
  trafficSource: string;
  targetGeo: string;
  vertical: string;
  payoutModel: string;
  payoutAmount: string;
  apiToken: string;
  affiliateApiKey: string;
  partnerBaseline: string;
  expectedConversionRate: string;
}

export async function submitOnboarding(formData: OnboardingFormData): Promise<{ success: boolean }> {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const clerkId = user.id;

  try {
    // Upsert user in database
    const dbUser = await prisma.users.upsert({
      where: { clerk_id: clerkId },
      create: {
        id: uuidv4(),
        email: email,
        clerk_id: clerkId,
        is_onboarding_completed: true,
      },
      update: {
        is_onboarding_completed: true,
        updated_at: new Date(),
      },
    });

    // Save settings - find existing or create new
    const existingSettings = await prisma.settings.findFirst({
      where: { user_id: dbUser.id },
    });

    if (existingSettings) {
      await prisma.settings.update({
        where: { id: existingSettings.id },
        data: {
          traffic_source: formData.trafficSource,
          traffic_source_api_key: formData.apiToken,
          vertical: formData.vertical,
          geo: formData.targetGeo,
          affiliate_api_key: formData.affiliateApiKey,
          updated_at: new Date(),
        },
      });
    } else {
      await prisma.settings.create({
        data: {
          user_id: dbUser.id,
          traffic_source: formData.trafficSource,
          traffic_source_api_key: formData.apiToken,
          vertical: formData.vertical,
          geo: formData.targetGeo,
          affiliate_api_key: formData.affiliateApiKey,
        },
      });
    }

    // Create project settings
    await prisma.project_settings.create({
      data: {
        project_name: `${formData.vertical} - ${formData.targetGeo}`,
        vertical: formData.vertical,
        geo: formData.targetGeo,
        target_cpa: formData.payoutAmount ? parseFloat(formData.payoutAmount) : null,
        min_conversion_rate: formData.expectedConversionRate ? parseFloat(formData.expectedConversionRate) : null,
        is_active: true,
      },
    });

  } catch (error) {
    console.error("Onboarding error:", error);
    throw new Error("Failed to complete onboarding");
  }

  return { success: true };
}

export async function checkOnboardingStatus(): Promise<{
  isOnboardingCompleted: boolean;
  user: { id: string; email: string; clerkId: string } | null;
}> {
  const user = await currentUser();

  if (!user) {
    return { isOnboardingCompleted: false, user: null };
  }

  try {
    const dbUser = await prisma.users.findUnique({
      where: { clerk_id: user.id },
    });

    if (!dbUser) {
      return { isOnboardingCompleted: false, user: null };
    }

    return {
      isOnboardingCompleted: dbUser.is_onboarding_completed ?? false,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        clerkId: dbUser.clerk_id ?? "",
      },
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return { isOnboardingCompleted: false, user: null };
  }
}

interface CampaignMetrics {
  external_id?: string;
  spend?: number;
  clicks?: number;
  impressions?: number;
  conversions?: number;
  revenue?: number;
  cpc?: number;
  ctr?: number;
  effective_status?: string;
}

export async function getUserCampaigns() {
  const user = await currentUser();

  if (!user) {
    return [];
  }

  try {
    const dbUser = await prisma.users.findUnique({
      where: { clerk_id: user.id },
      include: {
        campaigns: true,
      },
    });

    if (!dbUser) {
      return [];
    }

    // Transform campaigns to include metrics from JSON field
    return dbUser.campaigns.map((campaign) => {
      const metrics = (campaign.metrics as CampaignMetrics) || {};
      const spend = metrics.spend || 0;
      const revenue = metrics.revenue || 0;
      const netProfit = revenue - spend;
      const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;

      return {
        id: campaign.id,
        name: campaign.campaign_name || "Unnamed Campaign",
        source: campaign.platform || "facebook",
        status: campaign.status === "active" ? "Active" : "Paused",
        metrics,
        spend: spend.toFixed(2),
        revenue: revenue.toFixed(2),
        netProfit: netProfit,
        roi: roi.toFixed(1),
        riskScore: roi < 0 ? "50" : "0",
        recommendation: roi >= 20 ? "Scale" : roi >= 0 ? "Monitor" : "Pause",
        clicks: metrics.clicks || 0,
        impressions: metrics.impressions || 0,
        conversions: metrics.conversions || 0,
        ai_advice: roi >= 20 
          ? "Campaign performing well. Consider increasing budget."
          : roi >= 0 
            ? "Campaign breaking even. Monitor closely."
            : "Campaign underperforming. Consider pausing or optimizing.",
      };
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
}

export async function getPortfolioStats() {
  const user = await currentUser();

  if (!user) {
    return {
      totalSpend: 0,
      totalRevenue: 0,
      netProfit: 0,
      roi: 0,
      campaignCount: 0,
      activeCampaigns: 0,
    };
  }

  try {
    const dbUser = await prisma.users.findUnique({
      where: { clerk_id: user.id },
      include: {
        campaigns: true,
      },
    });

    if (!dbUser) {
      return {
        totalSpend: 0,
        totalRevenue: 0,
        netProfit: 0,
        roi: 0,
        campaignCount: 0,
        activeCampaigns: 0,
      };
    }

    const campaigns = dbUser.campaigns;
    const campaignCount = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === "active").length;

    // Calculate totals from campaign metrics
    let totalSpend = 0;
    let totalRevenue = 0;

    for (const campaign of campaigns) {
      const metrics = (campaign.metrics as CampaignMetrics) || {};
      totalSpend += metrics.spend || 0;
      totalRevenue += metrics.revenue || 0;
    }

    const netProfit = totalRevenue - totalSpend;
    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

    return {
      totalSpend,
      totalRevenue,
      netProfit,
      roi,
      campaignCount,
      activeCampaigns,
    };
  } catch (error) {
    console.error("Error fetching portfolio stats:", error);
    return {
      totalSpend: 0,
      totalRevenue: 0,
      netProfit: 0,
      roi: 0,
      campaignCount: 0,
      activeCampaigns: 0,
    };
  }
}
