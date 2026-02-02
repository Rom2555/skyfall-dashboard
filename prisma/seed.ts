import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create a test tenant
  const tenant = await prisma.tenants.create({
    data: {
      name: "Skyfall Media Agency",
      plan: "pro",
    },
  });
  console.log("✅ Created tenant:", tenant.id);

  // 2. Create a test user
  const user = await prisma.users.create({
    data: {
      id: "user_test_001",
      email: "demo@skyfall.io",
      password_hash: "hashed_password_placeholder",
    },
  });
  console.log("✅ Created user:", user.email);

  // 3. Create campaign_stats with real-looking data
  const campaignStatsData = [
    {
      campaign_name: "Finance Lead Gen - US",
      spend: 2500.0,
      revenue: 4200.0,
      clicks: 15000,
      conversions: 85,
      ai_roi_calc: 68.0,
      ai_advice: "SCALE. ROI is strong at 68%. Consider increasing budget by 20%.",
    },
    {
      campaign_name: "iGaming - CA Mobile",
      spend: 1800.0,
      revenue: 1200.0,
      clicks: 8500,
      conversions: 32,
      ai_roi_calc: -33.3,
      ai_advice: "OPTIMIZE. Negative ROI. Review targeting and creatives.",
    },
    {
      campaign_name: "Crypto Trading - LATAM",
      spend: 3200.0,
      revenue: 5800.0,
      clicks: 22000,
      conversions: 145,
      ai_roi_calc: 81.25,
      ai_advice: "SCALE. Excellent performance! Top performer in portfolio.",
    },
    {
      campaign_name: "E-commerce UK - Holiday",
      spend: 950.0,
      revenue: 1100.0,
      clicks: 6200,
      conversions: 28,
      ai_roi_calc: 15.8,
      ai_advice: "COLLECT DATA. Need more volume for accurate prediction.",
    },
    {
      campaign_name: "Dating App - EU iOS",
      spend: 1400.0,
      revenue: 600.0,
      clicks: 4800,
      conversions: 12,
      ai_roi_calc: -57.1,
      ai_advice: "STOP. Significant losses. Pause and reassess strategy.",
    },
  ];

  for (const stat of campaignStatsData) {
    await prisma.campaign_stats.create({
      data: {
        campaign_name: stat.campaign_name,
        spend: stat.spend,
        revenue: stat.revenue,
        clicks: stat.clicks,
        conversions: stat.conversions,
        ai_roi_calc: stat.ai_roi_calc,
        ai_advice: stat.ai_advice,
        last_analyzed_at: new Date(),
      },
    });
  }
  console.log("✅ Created 5 campaign stats");

  // 4. Create campaigns linked to the user
  const campaignsData = [
    {
      campaign_name: "Finance Lead Gen - US",
      platform: "Facebook",
      status: "Active",
      budget: 3000.0,
      metrics: { impressions: 450000, ctr: 3.33, cpc: 0.17 },
    },
    {
      campaign_name: "iGaming - CA Mobile",
      platform: "Google Ads",
      status: "Active",
      budget: 2000.0,
      metrics: { impressions: 280000, ctr: 3.04, cpc: 0.21 },
    },
    {
      campaign_name: "Crypto Trading - LATAM",
      platform: "TikTok",
      status: "Active",
      budget: 4000.0,
      metrics: { impressions: 620000, ctr: 3.55, cpc: 0.15 },
    },
  ];

  for (const camp of campaignsData) {
    await prisma.campaigns.create({
      data: {
        user_id: user.id,
        campaign_name: camp.campaign_name,
        platform: camp.platform,
        status: camp.status,
        budget: camp.budget,
        metrics: camp.metrics,
      },
    });
  }
  console.log("✅ Created 3 campaigns for user");

  // 5. Create metrics_daily data for charts
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    await prisma.metrics_daily.create({
      data: {
        tenant_id: tenant.id,
        platform: "Facebook",
        account_id: "act_123456789",
        campaign_id: "camp_001",
        date: date,
        impressions: Math.floor(Math.random() * 50000) + 30000,
        clicks: Math.floor(Math.random() * 2000) + 1000,
        spend: Math.floor(Math.random() * 500) + 200,
        ctr: Math.random() * 2 + 2,
        cpc: Math.random() * 0.3 + 0.1,
        conversions: Math.floor(Math.random() * 30) + 10,
        revenue: Math.floor(Math.random() * 800) + 300,
      },
    });
  }
  console.log("✅ Created 14 days of metrics_daily data");

  console.log("\n🎉 Seeding complete!");
  console.log("📊 Dashboard data is ready at http://localhost:3000");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
