import CampaignDashboard from "@/components/CampaignDashboard";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-8">
            <a href="/" className="font-bold text-xl flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">⚡</div>
              Campaign Analytics
            </a>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Unauthorized</h2>
            <p className="text-slate-500">Please log in to view campaigns.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the user from database
  const dbUser = await prisma.users.findUnique({
    where: { clerk_id: user.id },
  });

  if (!dbUser) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-8">
            <a href="/" className="font-bold text-xl flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">⚡</div>
              Campaign Analytics
            </a>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-700 mb-2">User Not Found</h2>
            <p className="text-slate-500">Please complete onboarding first.</p>
            <a href="/onboarding" className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              Complete Onboarding
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Fetch from campaigns table (not campaign_stats)
  const campaign = await prisma.campaigns.findFirst({
    where: {
      id: Number(id),
      user_id: dbUser.id,
    },
  });

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-8">
            <a href="/" className="font-bold text-xl flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">⚡</div>
              Campaign Analytics
            </a>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Campaign Not Found</h2>
            <p className="text-slate-500">The campaign with ID {id} does not exist.</p>
            <a href="/" className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Fetch historical metrics for the chart
  let chartData: { date: string; spend: number; revenue: number }[] = [];
  try {
    const metricsDaily = await prisma.metrics_daily.findMany({
      orderBy: { date: 'desc' },
      take: 14,
    });
    
    // Transform for chart with proper date serialization
    chartData = metricsDaily.map(row => ({
      date: row.date ? row.date.toISOString() : new Date().toISOString(),
      spend: Number(row.spend) || 0,
      revenue: Number(row.revenue) || 0,
    }));
  } catch (error) {
    console.error("Error fetching metrics:", error);
  }

  // Extract metrics from JSON field
  const metrics = (campaign.metrics as any) || {};
  const spend = Number(metrics.spend || 0);
  const revenue = Number(metrics.revenue || 0);
  const netProfit = revenue - spend;
  const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
  
  const campaignData = {
    id: campaign.id,
    name: campaign.campaign_name || "Unknown Campaign",
    spend: spend,
    revenue: revenue,
    netProfit: netProfit,
    roi: roi,
    clicks: metrics.clicks || 0,
    conversions: metrics.conversions || 0,
    riskScore: roi < 0 ? Math.abs(roi) : 0,
    confidence: roi >= 20 ? "High" : roi >= 0 ? "Medium" : "Low",
    ai_advice: roi >= 20 
      ? "Campaign performing well. Consider increasing budget."
      : roi >= 0 
        ? "Campaign breaking even. Monitor closely."
        : "Campaign underperforming. Consider pausing or optimizing.",
  };

  return <CampaignDashboard campaign={campaignData} chartData={chartData} />;
}