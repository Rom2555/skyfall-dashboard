import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OverviewChart } from "@/components/OverviewChart";
import { CampaignTable } from "@/components/CampaignTable";
import { PortfolioRiskCard } from "@/components/PortfolioRiskCard";
import { UserButton } from "@clerk/nextjs";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { checkOnboardingStatus, getPortfolioStats, getUserCampaigns } from "@/app/onboarding/actions";

export default async function Home() {
  // Check onboarding status
  const { isOnboardingCompleted, user } = await checkOnboardingStatus();

  // Redirect to onboarding if not completed
  if (!user || !isOnboardingCompleted) {
    redirect("/onboarding");
  }

  // Fetch real user data
  const [stats, userCampaigns] = await Promise.all([
    getPortfolioStats(),
    getUserCampaigns(),
  ]);

  const { totalSpend, totalRevenue, netProfit, roi, campaignCount, activeCampaigns } = stats;

  // Fetch metrics for chart - use Prisma instead of raw SQL for proper date handling
  let chartData: { date: string; spend: number; clicks: number }[] = [];
  try {
    const metricsDaily = await prisma.metrics_daily.findMany({
      orderBy: { date: 'desc' },
      take: 14,
    });
    
    // Transform for chart with proper date serialization
    chartData = metricsDaily.map(row => ({
      date: row.date ? row.date.toISOString() : new Date().toISOString(),
      spend: Number(row.spend) || 0,
      clicks: row.clicks || 0,
    }));
  } catch (error) {
    console.error("Database Error:", error);
  }

  const sourceStyles: Record<string, string> = {
    Facebook: "bg-blue-100 text-blue-800",
    "Google Ads": "bg-red-100 text-red-800",
    TikTok: "bg-gray-800 text-gray-100",
    "Bing Ads": "bg-teal-100 text-teal-800",
    Native: "bg-yellow-100 text-yellow-800",
  };

  const confidenceStyles = {
    High: "bg-blue-100 text-blue-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-gray-100 text-gray-700",
  };

  const recommendationStyles: Record<string, string> = {
    "STOP": "bg-red-100 text-red-700",
    "SCALE": "bg-green-100 text-green-700",
    "OPTIMIZE": "bg-yellow-100 text-yellow-700",
    "COLLECT DATA": "bg-gray-100 text-gray-700",
  };

  // Calculate totals from real user data
  const totalSpendFromCampaigns = totalSpend;
  const totalRevenueFromCampaigns = totalRevenue;
  const totalNetProfit = netProfit;
  const overallROI = roi;

  // Transform user campaigns for display - NO FALLBACK TO LEGACY DATA
  const campaigns = userCampaigns.map((stat: any) => {
    const spend = Number(stat.metrics?.spend || 0);
    const revenue = Number(stat.metrics?.revenue || 0);
    const netProfit = revenue - spend;
    const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
    
    return {
      id: stat.id,
      name: stat.name || "Unknown Campaign",
      source: stat.platform || "Facebook",
      status: stat.status || (roi >= 0 ? "Active" : "Needs Review"),
      spend: spend.toFixed(0),
      revenue: revenue.toFixed(0),
      netProfit: netProfit,
      roi: roi.toFixed(1),
      riskScore: roi < 0 ? Math.abs(roi).toFixed(0) : "0",
      ai_advice: stat.ai_advice || null,
      recommendation: "",
    };
  });

  // Show empty state for new users
  if (campaigns.length === 0) {
    return (
      <div className="w-full px-6 bg-slate-50 font-sans pb-10 min-h-screen">
        <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-8">
            <a href="/campaigns" className="font-bold text-xl flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">⚡</div>
              Campaign Analytics
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="/onboarding" 
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors text-sm"
            >
              ⚙️ Settings
            </a>
            <UserButton afterSignOutUrl="/" />
          </div>
        </nav>

        <main className="max-w-4xl mx-auto py-16">
          <Card className="border-slate-200 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-2xl font-bold text-slate-700 mb-3">Welcome to Campaign Analytics!</h2>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Your dashboard is ready. Once you connect your ad accounts, your campaigns and metrics will appear here automatically.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-3xl font-bold text-slate-400">$0.00</div>
                  <div className="text-sm text-slate-500 mt-1">Total Spend</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-3xl font-bold text-emerald-500">$0.00</div>
                  <div className="text-sm text-slate-500 mt-1">Net Profit</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-3xl font-bold text-slate-400">0</div>
                  <div className="text-sm text-slate-500 mt-1">Campaigns</div>
                </div>
              </div>
              <a 
                href="/onboarding" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
              >
                Connect Ad Account →
              </a>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full px-6 bg-slate-50 font-sans pb-10">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-8">
          <a href="/campaigns" className="font-bold text-xl flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">⚡</div>
            Campaign Analytics
          </a>
        </div>
        <div className="flex items-center gap-3">
           <a 
             href="/onboarding" 
             className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors text-sm"
           >
             ⚙️ Onboarding
           </a>
           <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <PortfolioRiskCard
            campaigns={campaigns.map(c => ({
              id: c.id,
              name: c.name,
              spend: c.spend,
              revenue: c.revenue,
              netProfit: c.netProfit,
              roi: c.roi,
              riskScore: c.riskScore,
              ai_advice: c.ai_advice,
            }))}
            totalSpend={totalSpendFromCampaigns}
            totalRevenue={totalRevenueFromCampaigns}
            totalNetProfit={totalNetProfit}
            overallROI={overallROI}
            isEmpty={campaigns.length === 0}
          />

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Тренд расходов</CardTitle>
              <p className="text-sm text-slate-500">
                {campaigns.length > 0 ? "Динамика трат за последние 14 дней" : "Подключите рекламный аккаунт для просмотра данных"}
              </p>
            </CardHeader>
            <CardContent className="pl-0 pr-4">
              {campaigns.length > 0 && chartData.length > 0 ? (
                <OverviewChart data={chartData} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <p>Нет данных для отображения</p>
                    <p className="text-sm mt-1">Графики появятся после синхронизации данных</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {campaigns.length > 0 && (
          <CampaignTable campaigns={campaigns} recommendationStyles={recommendationStyles} />
        )}
      </main>
    </div>
  );
}
