"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendRevenueChart } from "@/components/SpendRevenueChart";
import { Play, ArrowLeft, DollarSign, Percent, MousePointerClick, TrendingUp, Globe, Building2, Users, Target } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Consistent number formatter to avoid hydration mismatches
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface ChartDataPoint {
  date: string;
  spend: number;
  revenue: number;
}

interface CampaignProps {
  id: number;
  name: string;
  spend: number;
  revenue: number;
  netProfit: number;
  roi: number;
  clicks: number;
  conversions: number;
  riskScore: number;
  confidence: string;
  ai_advice: string;
  metrics?: {
    spend?: number;
    clicks?: number;
  };
}

interface DashboardProps {
  campaign: CampaignProps;
  chartData?: ChartDataPoint[];
}

export default function CampaignDashboard({ campaign, chartData = [] }: DashboardProps) {
  const [isPaused, setIsPaused] = useState(false);

  const handleToggleCampaign = () => {
    setIsPaused((prev) => !prev);
  };

  const displaySpend = campaign.metrics?.spend ?? campaign.spend;
  const displayClicks = campaign.metrics?.clicks ?? campaign.clicks;
  const profitColor = campaign.netProfit >= 0 ? "text-green-600" : "text-red-600";
  const roiColor = campaign.roi >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="w-full px-6 bg-slate-50 font-sans pb-10 min-h-screen">
      {/* Navigation Bar - Matching main dashboard exactly */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm -mx-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">⚡</div>
            Campaign Analytics
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">JD</div>
        </div>
      </nav>

      <main className="space-y-8 pt-6">
        {/* Page Header with Breadcrumb */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Link href="/" className="hover:text-slate-700 transition-colors">Dashboard</Link>
              <span>/</span>
              <span className="text-slate-900 font-medium">Campaign Details</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{campaign.name}</h1>
            <p className="text-sm text-slate-500 mt-1">Campaign ID: {campaign.id}</p>
          </div>
          <Badge className={`text-sm px-3 py-1.5 ${isPaused ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
            {isPaused ? "Paused" : "Active"}
          </Badge>
        </div>

        {/* Top Cards - Two Column Grid matching dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Card - Net Profit (styled like Portfolio Risk Overview) */}
          <Card className="bg-[#FFFBEB] border-yellow-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold text-slate-900">Net Profit</CardTitle>
                <div className="p-2 bg-white rounded-full border border-yellow-100 shadow-sm">💰</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                <div>
                  <p className="text-sm font-medium text-slate-500">Net Profit</p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className={`text-4xl font-bold ${profitColor}`} suppressHydrationWarning>
                      {campaign.netProfit >= 0 ? "+" : ""}${formatCurrency(campaign.netProfit)}
                    </span>
                  </div>
                  <span className={`font-medium px-2 py-0.5 rounded text-sm mt-2 inline-block ${campaign.roi >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`} suppressHydrationWarning>
                    ROI: {campaign.roi >= 0 ? "+" : ""}{campaign.roi.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Spend</p>
                    <span className="text-2xl font-bold text-blue-600" suppressHydrationWarning>${formatCurrency(displaySpend)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Revenue</p>
                    <span className="text-2xl font-bold text-slate-900" suppressHydrationWarning>${formatCurrency(campaign.revenue)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Card - Risk Assessment */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg font-semibold text-slate-900">Оценка рисков</CardTitle>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Точность: {campaign.confidence}</Badge>
                </div>
                <div className="p-2 bg-white rounded-full border border-slate-100 shadow-sm">⚠️</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                <div>
                  <p className="text-sm font-medium text-slate-500">Risk Score</p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-4xl font-bold text-amber-700" suppressHydrationWarning>
                      {campaign.riskScore.toFixed(0)}%
                    </span>
                    <span className="text-slate-500 text-sm">вероятность убытка</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Button
                    variant={isPaused ? "default" : "destructive"}
                    className={`w-full ${isPaused ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                    onClick={handleToggleCampaign}
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-4 h-4 mr-2" /> Возобновить
                      </>
                    ) : (
                      "Остановить"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart and AI Analysis - Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Spend vs Revenue Chart */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Расходы vs Доходы</CardTitle>
              <p className="text-sm text-slate-500">Динамика за последние 14 дней</p>
            </CardHeader>
            <CardContent className="pl-0 pr-4">
              <SpendRevenueChart data={chartData} />
            </CardContent>
          </Card>

          {/* AI Advice Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg font-semibold text-slate-900">AI Analysis</CardTitle>
                <Badge className="bg-purple-100 text-purple-700">Powered by AI</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{campaign.ai_advice}</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid - Four Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-500">Clicks</p>
              <p className="text-2xl font-bold text-slate-900" suppressHydrationWarning>
                {formatCurrency(displayClicks)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-500">Conversions</p>
              <p className="text-2xl font-bold text-slate-900" suppressHydrationWarning>
                {formatCurrency(campaign.conversions)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-500">CTR</p>
              <p className="text-2xl font-bold text-slate-900" suppressHydrationWarning>
                {displayClicks > 0 ? ((campaign.conversions / displayClicks) * 100).toFixed(2) : "0.00"}%
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-500">CPA</p>
              <p className="text-2xl font-bold text-slate-900" suppressHydrationWarning>
                ${campaign.conversions > 0 ? formatCurrency(displaySpend / campaign.conversions) : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ========== NEW SECTIONS BELOW ========== */}

        {/* Key Metrics Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Total Spend</p>
                </div>
                <p className="text-2xl font-bold text-blue-600" suppressHydrationWarning>
                  ${formatCurrency(displaySpend)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                </div>
                <p className="text-2xl font-bold text-green-600" suppressHydrationWarning>
                  ${formatCurrency(campaign.revenue)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${campaign.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <DollarSign className={`w-4 h-4 ${campaign.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Net Profit</p>
                </div>
                <p className={`text-2xl font-bold ${profitColor}`} suppressHydrationWarning>
                  {campaign.netProfit >= 0 ? '+' : ''}${formatCurrency(campaign.netProfit)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${campaign.roi >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Percent className={`w-4 h-4 ${campaign.roi >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <p className="text-sm font-medium text-slate-500">ROI</p>
                </div>
                <p className={`text-2xl font-bold ${roiColor}`} suppressHydrationWarning>
                  {campaign.roi >= 0 ? '+' : ''}{campaign.roi.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MousePointerClick className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">CTR</p>
                </div>
                <p className="text-2xl font-bold text-purple-600" suppressHydrationWarning>
                  {displayClicks > 0 ? ((campaign.conversions / displayClicks) * 100).toFixed(2) : '0.00'}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">CPC</p>
                </div>
                <p className="text-2xl font-bold text-amber-600" suppressHydrationWarning>
                  ${displayClicks > 0 ? (displaySpend / displayClicks).toFixed(2) : '0.00'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conversion Funnel Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Conversion Funnel</h2>
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="pt-6 pb-6">
              <div className="space-y-6">
                {/* Clicks - Top of funnel */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MousePointerClick className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Clicks</p>
                        <p className="text-sm text-slate-500">Total traffic received</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900" suppressHydrationWarning>{formatCurrency(displayClicks)}</p>
                      <p className="text-sm text-slate-500">100% of traffic</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex justify-center">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-300"></div>
                </div>

                {/* Pre-Conversions - Middle of funnel */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Pre-Conversions</p>
                        <p className="text-sm text-slate-500">Registrations / Sign-ups</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900" suppressHydrationWarning>{formatCurrency(Math.round(campaign.conversions * 2.5))}</p>
                      <p className="text-sm text-slate-500" suppressHydrationWarning>
                        {displayClicks > 0 ? ((campaign.conversions * 2.5 / displayClicks) * 100).toFixed(1) : '0.0'}% of clicks
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-amber-500 h-3 rounded-full" style={{ width: `${Math.min(100, displayClicks > 0 ? (campaign.conversions * 2.5 / displayClicks) * 100 * 3 : 0)}%` }}></div>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex justify-center">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-300"></div>
                </div>

                {/* Target Conversions - Bottom of funnel */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Target Conversions</p>
                        <p className="text-sm text-slate-500">Deposits / Purchases</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600" suppressHydrationWarning>{formatCurrency(campaign.conversions)}</p>
                      <p className="text-sm text-slate-500" suppressHydrationWarning>
                        {displayClicks > 0 ? ((campaign.conversions / displayClicks) * 100).toFixed(2) : '0.00'}% of clicks
                      </p>
                      <p className="text-xs text-amber-600 mt-1">Expected: {Math.round(campaign.conversions * 1.2)} ({campaign.conversions - Math.round(campaign.conversions * 1.2)})</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${Math.min(100, displayClicks > 0 ? (campaign.conversions / displayClicks) * 100 * 10 : 0)}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benchmarks Reference Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Benchmarks Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Vertical</p>
                </div>
                <p className="text-lg font-bold text-slate-900">Finance</p>
                <p className="text-sm text-slate-500 mt-1">iGaming / Crypto</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-teal-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">GEO</p>
                </div>
                <p className="text-lg font-bold text-slate-900">United States</p>
                <p className="text-sm text-slate-500 mt-1">Tier 1 Market</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Traffic Source</p>
                </div>
                <p className="text-lg font-bold text-slate-900">Google Ads</p>
                <p className="text-sm text-slate-500 mt-1">Search + Display</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-pink-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Partner Baseline</p>
                </div>
                <p className="text-lg font-bold text-slate-900">15 regs → 1 dep</p>
                <p className="text-sm text-slate-500 mt-1">6.7% reg-to-dep rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
