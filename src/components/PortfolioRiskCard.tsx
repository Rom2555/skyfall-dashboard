"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface CampaignData {
  id: number;
  name: string;
  spend: string;
  revenue: string;
  netProfit: number;
  roi: string;
  riskScore: string;
  ai_advice: string | null;
}

interface PortfolioRiskCardProps {
  campaigns: CampaignData[];
  totalSpend: number;
  totalRevenue: number;
  totalNetProfit: number;
  overallROI: number;
  isEmpty?: boolean;
}

export function PortfolioRiskCard({
  campaigns,
  totalSpend,
  totalRevenue,
  totalNetProfit,
  overallROI,
  isEmpty = false,
}: PortfolioRiskCardProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | "all">("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // If no campaigns, show empty state
  const hasNoCampaigns = isEmpty || campaigns.length === 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate display values based on selection
  const selectedCampaign = selectedCampaignId === "all" 
    ? null 
    : campaigns.find(c => c.id === selectedCampaignId);

  const displayNetProfit = selectedCampaign ? selectedCampaign.netProfit : totalNetProfit;
  const displayROI = selectedCampaign ? parseFloat(selectedCampaign.roi) : overallROI;
  const displaySpend = selectedCampaign ? parseFloat(selectedCampaign.spend) : totalSpend;
  const displayRevenue = selectedCampaign ? parseFloat(selectedCampaign.revenue) : totalRevenue;
  const displayRiskScore = selectedCampaign ? parseFloat(selectedCampaign.riskScore) : 0;
  const campaignsAtRisk = hasNoCampaigns ? 0 : campaigns.filter(c => parseFloat(c.riskScore) > 0).length;

  // Get advice text
  const adviceText = hasNoCampaigns
    ? "Пока нет данных для анализа. Подключите рекламный аккаунт, чтобы начать отслеживать кампании."
    : selectedCampaign 
      ? selectedCampaign.ai_advice || "Нет данных для анализа."
      : "Портфель показывает смешанную динамику. Проверьте отстающие кампании и скорректируйте таргетинг.";

  // Get dropdown display text
  const dropdownText = selectedCampaignId === "all" 
    ? `${campaigns.length}` 
    : "1";

  const handleCampaignSelect = (id: number | "all") => {
    setSelectedCampaignId(id);
    setIsDropdownOpen(false);
  };

  return (
    <Card className="bg-[#FFFBEB] border-yellow-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold text-slate-900">
                {selectedCampaignId === "all" ? "Обзор рисков портфеля" : selectedCampaign?.name}
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                {hasNoCampaigns ? "Нет данных" : (selectedCampaignId === "all" ? "Точность: Высокая" : (displayROI >= 20 ? "Высокая" : displayROI >= 0 ? "Средняя" : "Низкая"))}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {hasNoCampaigns 
                ? "Подключите рекламный аккаунт для анализа"
                : (selectedCampaignId === "all" 
                  ? "Системный анализ по всем активным кампаниям" 
                  : "Детальный анализ выбранной кампании")}
            </p>
          </div>
          <div className="p-2 bg-white rounded-full border border-yellow-100 shadow-sm">{hasNoCampaigns ? "📊" : "⚠️"}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          <div>
            <p className="text-sm font-medium text-slate-500">Net Profit</p>
            <div className="flex items-baseline gap-3 mt-1">
              <span className={`text-4xl font-bold ${displayNetProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${displayNetProfit >= 0 ? "+" : ""}{displayNetProfit.toLocaleString()}
              </span>
              <span className={`font-medium px-2 py-0.5 rounded text-sm ${displayROI >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                ROI: {displayROI >= 0 ? "+" : ""}{displayROI.toFixed(1)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              {selectedCampaignId === "all" ? "Средний риск убытков" : "Риск убытков"}
            </p>
            <div className="flex items-baseline gap-3 mt-1">
              {selectedCampaignId === "all" ? (
                <>
                  <span className={`text-4xl font-bold ${hasNoCampaigns ? "text-slate-400" : "text-amber-700"}`}>
                    {campaignsAtRisk} / {campaigns.length}
                  </span>
                  <span className="text-slate-500 text-sm">
                    {hasNoCampaigns ? "нет данных" : "кампаний в зоне риска"}
                  </span>
                </>
              ) : (
                <>
                  <span className={`text-4xl font-bold ${displayRiskScore > 0 ? "text-amber-700" : "text-green-600"}`}>
                    {displayRiskScore.toFixed(0)}%
                  </span>
                  <span className="text-slate-500 text-sm">
                    {displayRiskScore > 0 ? "вероятность убытка" : "низкий риск"}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Окно прогноза: 24-48 часов</p>
          </div>
        </div>

        {/* Analysis Text */}
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-sm text-amber-800 leading-relaxed">
            {adviceText}
          </p>
        </div>

        {/* Footer Stats Row */}
        <div className="mt-4 pt-4 border-t border-yellow-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">TOTAL SPEND</p>
              <p className="text-lg font-bold text-blue-600">${displaySpend.toLocaleString()}</p>
            </div>
            <div className="text-center border-l border-r border-yellow-200">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">TOTAL REVENUE</p>
              <p className="text-lg font-bold text-slate-900">${displayRevenue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">ACTIVE CAMPAIGNS</p>
              <div className="relative inline-block" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer mx-auto"
                >
                  {dropdownText}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Выберите кампанию</p>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {/* All Campaigns Option */}
                      <button
                        onClick={() => handleCampaignSelect("all")}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          selectedCampaignId === "all" 
                            ? "bg-blue-50 text-blue-600 font-medium" 
                            : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        }`}
                      >
                        🌐 Все кампании
                      </button>
                      
                      {/* Individual Campaigns */}
                      {campaigns.map((campaign) => (
                        <button
                          key={campaign.id}
                          onClick={() => handleCampaignSelect(campaign.id)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            selectedCampaignId === campaign.id 
                              ? "bg-blue-50 text-blue-600 font-medium" 
                              : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                          }`}
                        >
                          {campaign.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
