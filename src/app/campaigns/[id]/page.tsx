import CampaignDashboard from "@/components/CampaignDashboard";
import prisma from "@/lib/prisma";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch from campaign_stats since that's where our data is
  const campaignStat = await prisma.campaign_stats.findUnique({
    where: { id: Number(id) },
  });

  if (!campaignStat) {
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
  // Since our metrics_daily data doesn't have campaign-specific data yet,
  // we'll use the overall metrics but can filter by campaign_id in the future
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

  // Transform to expected format with all required fields
  const spend = Number(campaignStat.spend || 0);
  const revenue = Number(campaignStat.revenue || 0);
  const netProfit = revenue - spend;
  const roi = Number(campaignStat.ai_roi_calc) || (spend > 0 ? ((revenue - spend) / spend) * 100 : 0);
  
  const campaign = {
    id: campaignStat.id,
    name: campaignStat.campaign_name || "Unknown Campaign",
    spend: spend,
    revenue: revenue,
    netProfit: netProfit,
    roi: roi,
    clicks: campaignStat.clicks || 0,
    conversions: campaignStat.conversions || 0,
    riskScore: roi < 0 ? Math.abs(roi) : 0,
    confidence: roi >= 20 ? "High" : roi >= 0 ? "Medium" : "Low",
    ai_advice: campaignStat.ai_advice || "No analysis available",
  };

  return <CampaignDashboard campaign={campaign} chartData={chartData} />;
}