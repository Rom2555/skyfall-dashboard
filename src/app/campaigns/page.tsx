import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OverviewChart } from "@/components/OverviewChart";
import { CampaignAnalyzer } from "@/components/CampaignAnalyzer";
import { FacebookSyncButton } from "@/components/FacebookSyncButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { checkOnboardingStatus, getUserCampaigns, getPortfolioStats } from "@/app/onboarding/actions";
import { UserButton } from "@clerk/nextjs";

export default async function CampaignsPage() {
  // Check onboarding status
  const { isOnboardingCompleted, user } = await checkOnboardingStatus();

  // Redirect to onboarding if not completed
  if (!user || !isOnboardingCompleted) {
    redirect("/onboarding");
  }

  // Fetch real data
  const [campaigns, stats] = await Promise.all([
    getUserCampaigns(),
    getPortfolioStats(),
  ]);

  const { totalSpend, totalRevenue, netProfit, roi, campaignCount, activeCampaigns } = stats;

  // Determine profit/loss styling
  const isProfit = netProfit >= 0;
  const profitColor = isProfit ? "text-emerald-600" : "text-red-600";
  const profitBg = isProfit ? "bg-emerald-50" : "bg-red-50";

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-8">
          <Link href="/campaigns" className="font-bold text-xl flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">⚡</div>
            Campaign Analytics
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/onboarding" 
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors text-sm"
          >
            ⚙️ Settings
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Панель управления</h1>
            <p className="text-slate-500 mt-1">Анализ рисков и эффективности кампаний в реальном времени</p>
          </div>
          <FacebookSyncButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#FFFBEB] border-yellow-200 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg font-semibold text-slate-900">Анализ рисков портфеля</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                      {campaignCount > 0 ? "Точность: Высокая" : "Нет данных"}
                    </Badge>
                  </div>
                  <div className="p-2 bg-white rounded-full border border-yellow-100 shadow-sm">
                    {campaignCount > 0 ? "⚠️" : "📊"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Чистая прибыль</p>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className={`text-4xl font-bold ${profitColor}`}>
                        {isProfit ? "+" : "-"}${Math.abs(netProfit).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {totalSpend > 0 && (
                        <span className={`${profitColor} font-medium ${profitBg} px-2 py-0.5 rounded text-sm`}>
                          ROI: {roi >= 0 ? "+" : ""}{roi.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Общий расход</p>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-4xl font-bold text-slate-700">
                        ${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Тренд расходов</CardTitle>
                <p className="text-sm text-slate-500">
                  {campaignCount > 0 
                    ? "Динамика трат за последние 14 дней" 
                    : "Подключите источник трафика для просмотра данных"}
                </p>
              </CardHeader>
              <CardContent className="pl-0 pr-4">
                {campaignCount > 0 ? (
                  <OverviewChart data={[]} />
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📈</div>
                      <p>Нет данных для отображения</p>
                      <p className="text-sm mt-1">Здесь появится тренд расходов</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Активные кампании</h3>
              <Badge variant="outline" className="text-xs">
                {activeCampaigns} / {campaignCount}
              </Badge>
            </div>
            
            {campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns.slice(0, 5).map((campaign: any) => {
                  const spend = Number(campaign.metrics?.spend || 0) || 0;
                  const revenue = Number(campaign.metrics?.revenue || 0) || 0;
                  const profit = revenue - spend;
                  const isCampaignProfit = profit >= 0;

                  return (
                    <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="block group">
                      <Card className="hover:shadow-md transition-all border-slate-200 cursor-pointer group-hover:border-slate-300">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                              {campaign.name || `Campaign ${campaign.id}`}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] px-1.5 py-0 h-5 ${
                                campaign.status === "active" 
                                  ? "border-green-300 text-green-700" 
                                  : "border-slate-300 text-slate-500"
                              }`}
                            >
                              {campaign.status || "Active"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-xs text-slate-400 font-bold">РАСХОД</p>
                              <p className="font-mono text-lg font-bold text-blue-800">
                                ${spend.toFixed(0)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400 font-bold">ПРОФИТ</p>
                              <p className={`font-mono ${isCampaignProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isCampaignProfit ? '+' : '-'}${Math.abs(profit).toFixed(0)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Card className="border-slate-200 border-dashed">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">🚀</div>
                  <p className="font-medium text-slate-700">Кампании не найдены</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Подключите источник трафика для анализа
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/onboarding">Добавить источник</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {campaigns.length > 5 && (
              <Button variant="outline" className="w-full">
                Все кампании ({campaignCount})
              </Button>
            )}
          </div>
        </div>

        {/* AI Analyzer Section */}
        <div className="mt-8">
          <CampaignAnalyzer />
        </div>
      </main>
    </div>
  );
}
