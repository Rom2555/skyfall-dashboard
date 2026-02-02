"use client";

import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

// Consistent number formatter to avoid hydration mismatches
const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

interface Campaign {
  id: number;
  name: string;
  source: string;
  status: string;
  spend: string;
  revenue: string;
  netProfit: number;
  roi: string;
  riskScore: string;
  recommendation: string;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  recommendationStyles: Record<string, string>;
}

export function CampaignTable({ campaigns, recommendationStyles }: CampaignTableProps) {
  const router = useRouter();

  const handleRowClick = (id: number) => {
    router.push(`/campaigns/${id}`);
  };

  // Handle empty state
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="w-full">
        <h3 className="font-semibold text-slate-900 mb-4">Эффективность кампаний</h3>
        <div className="w-full bg-white border border-slate-200 border-dashed rounded-lg p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="font-medium text-slate-700">Кампании не найдены</p>
          <p className="text-sm text-slate-500 mt-1">Подключите источник трафика для анализа</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="font-semibold text-slate-900 mb-4">Эффективность кампаний</h3>
      <table className="w-full bg-white border border-slate-200 text-sm rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-slate-50">
            <th className="w-[25%] px-4 py-3 text-left text-xs uppercase text-slate-400 font-semibold">Campaign</th>
            <th className="w-[10%] px-4 py-3 text-center text-xs uppercase text-slate-400 font-semibold">Status</th>
            <th className="w-[10%] px-4 py-3 text-right text-xs uppercase text-slate-400 font-semibold">Spend</th>
            <th className="w-[10%] px-4 py-3 text-right text-xs uppercase text-slate-400 font-semibold">Revenue</th>
            <th className="w-[10%] px-4 py-3 text-right text-xs uppercase text-slate-400 font-semibold">Net Profit</th>
            <th className="w-[10%] px-4 py-3 text-right text-xs uppercase text-slate-400 font-semibold">ROI</th>
            <th className="w-[15%] px-4 py-3 text-center text-xs uppercase text-slate-400 font-semibold">AI Advice</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr 
              key={campaign.id} 
              className="hover:bg-blue-50 border-b border-slate-100 cursor-pointer transition-colors"
              onClick={() => handleRowClick(campaign.id)}
            >
              <td className="w-[25%] px-4 py-3 text-left">
                <span className="font-medium text-slate-900 hover:text-blue-600">
                  {campaign.name}
                </span>
                <div className="text-xs text-slate-500">{campaign.source}</div>
              </td>
              <td className="w-[10%] px-4 py-3 text-center">
                <Badge className={`text-xs px-2 py-0.5 rounded-full ${campaign.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {campaign.status}
                </Badge>
              </td>
              <td className="w-[10%] px-4 py-3 text-right font-semibold text-blue-600" suppressHydrationWarning>
                ${formatCurrency(campaign.spend)}
              </td>
              <td className="w-[10%] px-4 py-3 text-right font-semibold text-blue-600" suppressHydrationWarning>
                ${formatCurrency(campaign.revenue)}
              </td>
              <td className={`w-[10%] px-4 py-3 text-right font-bold ${campaign.netProfit >= 0 ? "text-green-600" : "text-red-600"}`} suppressHydrationWarning>
                {campaign.netProfit >= 0 ? "+" : ""}${formatCurrency(campaign.netProfit)}
              </td>
              <td className={`w-[10%] px-4 py-3 text-right font-bold ${Number(campaign.roi) >= 0 ? "text-green-600" : "text-red-600"}`}>
                {Number(campaign.roi) >= 0 ? "+" : ""}{campaign.roi}%
              </td>
              <td className="w-[15%] px-4 py-3 text-center">
                <Badge className={`text-xs px-2 py-1 rounded-full ${recommendationStyles[campaign.recommendation] || "bg-gray-100 text-gray-700"}`}>
                  {campaign.recommendation || "АНАЛИЗ"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
