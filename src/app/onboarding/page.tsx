"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  Database, 
  Check,
  Globe,
  Target,
  Wallet,
  Key,
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { submitOnboarding } from "./actions";

// Traffic sources
const trafficSources = [
  { value: "facebook", label: "Facebook", api: "Facebook Marketing API" },
  { value: "google", label: "Google Ads", api: "Google Ads API" },
  { value: "tiktok", label: "TikTok", api: "TikTok Marketing API" },
  { value: "unity", label: "Unity Ads", api: "Unity Ads API" },
  { value: "bing", label: "Bing Ads", api: "Microsoft Advertising API" },
];

// GEO options - All world countries
const geoOptions = [
  // Tier 1
  { value: "US", label: "🇺🇸 United States" },
  { value: "GB", label: "🇬🇧 United Kingdom" },
  { value: "CA", label: "🇨🇦 Canada" },
  { value: "AU", label: "🇦🇺 Australia" },
  { value: "DE", label: "🇩🇪 Germany" },
  { value: "FR", label: "🇫🇷 France" },
  { value: "NL", label: "🇳🇱 Netherlands" },
  { value: "BE", label: "🇧🇪 Belgium" },
  { value: "AT", label: "🇦🇹 Austria" },
  { value: "CH", label: "🇨🇭 Switzerland" },
  { value: "NZ", label: "🇳🇿 New Zealand" },
  { value: "IE", label: "🇮🇪 Ireland" },
  { value: "SE", label: "🇸🇪 Sweden" },
  { value: "NO", label: "🇳🇴 Norway" },
  { value: "DK", label: "🇩🇰 Denmark" },
  { value: "FI", label: "🇫🇮 Finland" },
  // Tier 2
  { value: "IT", label: "🇮🇹 Italy" },
  { value: "ES", label: "🇪🇸 Spain" },
  { value: "PT", label: "🇵🇹 Portugal" },
  { value: "PL", label: "🇵🇱 Poland" },
  { value: "CZ", label: "🇨🇿 Czech Republic" },
  { value: "HU", label: "🇭🇺 Hungary" },
  { value: "RO", label: "🇷🇴 Romania" },
  { value: "BG", label: "🇧🇬 Bulgaria" },
  { value: "GR", label: "🇬🇷 Greece" },
  { value: "HR", label: "🇭🇷 Croatia" },
  { value: "SK", label: "🇸🇰 Slovakia" },
  { value: "SI", label: "🇸🇮 Slovenia" },
  // CIS
  { value: "RU", label: "🇷🇺 Russia" },
  { value: "UA", label: "🇺🇦 Ukraine" },
  { value: "KZ", label: "🇰🇿 Kazakhstan" },
  { value: "BY", label: "🇧🇾 Belarus" },
  { value: "UZ", label: "🇺🇿 Uzbekistan" },
  { value: "AZ", label: "🇦🇿 Azerbaijan" },
  { value: "GE", label: "🇬🇪 Georgia" },
  { value: "AM", label: "🇦🇲 Armenia" },
  { value: "MD", label: "🇲🇩 Moldova" },
  { value: "KG", label: "🇰🇬 Kyrgyzstan" },
  { value: "TJ", label: "🇹🇯 Tajikistan" },
  { value: "TM", label: "🇹🇲 Turkmenistan" },
  // Asia
  { value: "JP", label: "🇯🇵 Japan" },
  { value: "KR", label: "🇰🇷 South Korea" },
  { value: "CN", label: "🇨🇳 China" },
  { value: "HK", label: "🇭🇰 Hong Kong" },
  { value: "TW", label: "🇹🇼 Taiwan" },
  { value: "SG", label: "🇸🇬 Singapore" },
  { value: "MY", label: "🇲🇾 Malaysia" },
  { value: "TH", label: "🇹🇭 Thailand" },
  { value: "VN", label: "🇻🇳 Vietnam" },
  { value: "PH", label: "🇵🇭 Philippines" },
  { value: "ID", label: "🇮🇩 Indonesia" },
  { value: "IN", label: "🇮🇳 India" },
  { value: "PK", label: "🇵🇰 Pakistan" },
  { value: "BD", label: "🇧🇩 Bangladesh" },
  { value: "LK", label: "🇱🇰 Sri Lanka" },
  { value: "NP", label: "🇳🇵 Nepal" },
  // Middle East
  { value: "AE", label: "🇦🇪 UAE" },
  { value: "SA", label: "🇸🇦 Saudi Arabia" },
  { value: "QA", label: "🇶🇦 Qatar" },
  { value: "KW", label: "🇰🇼 Kuwait" },
  { value: "BH", label: "🇧🇭 Bahrain" },
  { value: "OM", label: "🇴🇲 Oman" },
  { value: "IL", label: "🇮🇱 Israel" },
  { value: "TR", label: "🇹🇷 Turkey" },
  { value: "EG", label: "🇪🇬 Egypt" },
  { value: "JO", label: "🇯🇴 Jordan" },
  { value: "LB", label: "🇱🇧 Lebanon" },
  // Latin America
  { value: "BR", label: "🇧🇷 Brazil" },
  { value: "MX", label: "🇲🇽 Mexico" },
  { value: "AR", label: "🇦🇷 Argentina" },
  { value: "CL", label: "🇨🇱 Chile" },
  { value: "CO", label: "🇨🇴 Colombia" },
  { value: "PE", label: "🇵🇪 Peru" },
  { value: "VE", label: "🇻🇪 Venezuela" },
  { value: "EC", label: "🇪🇨 Ecuador" },
  { value: "UY", label: "🇺🇾 Uruguay" },
  { value: "PY", label: "🇵🇾 Paraguay" },
  { value: "BO", label: "🇧🇴 Bolivia" },
  { value: "CR", label: "🇨🇷 Costa Rica" },
  { value: "PA", label: "🇵🇦 Panama" },
  { value: "DO", label: "🇩🇴 Dominican Republic" },
  { value: "PR", label: "🇵🇷 Puerto Rico" },
  // Africa
  { value: "ZA", label: "🇿🇦 South Africa" },
  { value: "NG", label: "🇳🇬 Nigeria" },
  { value: "KE", label: "🇰🇪 Kenya" },
  { value: "GH", label: "🇬🇭 Ghana" },
  { value: "TZ", label: "🇹🇿 Tanzania" },
  { value: "UG", label: "🇺🇬 Uganda" },
  { value: "ET", label: "🇪🇹 Ethiopia" },
  { value: "MA", label: "🇲🇦 Morocco" },
  { value: "DZ", label: "🇩🇿 Algeria" },
  { value: "TN", label: "🇹🇳 Tunisia" },
  // Baltic
  { value: "LT", label: "🇱🇹 Lithuania" },
  { value: "LV", label: "🇱🇻 Latvia" },
  { value: "EE", label: "🇪🇪 Estonia" },
  // Other Europe
  { value: "CY", label: "🇨🇾 Cyprus" },
  { value: "MT", label: "🇲🇹 Malta" },
  { value: "LU", label: "🇱🇺 Luxembourg" },
  { value: "IS", label: "🇮🇸 Iceland" },
  { value: "RS", label: "🇷🇸 Serbia" },
  { value: "BA", label: "🇧🇦 Bosnia" },
  { value: "MK", label: "🇲🇰 North Macedonia" },
  { value: "AL", label: "🇦🇱 Albania" },
  { value: "ME", label: "🇲🇪 Montenegro" },
];

// Verticals
const verticals = [
  { value: "gambling", label: "Gambling / iGaming" },
  { value: "betting", label: "Betting / Sports" },
  { value: "crypto", label: "Crypto / Trading" },
  { value: "finance", label: "Finance / Banking" },
  { value: "nutra", label: "Nutra / Health" },
  { value: "other", label: "Other" },
];

// Payout models
const payoutModels = [
  { value: "cpa", label: "CPA", description: "Cost Per Action" },
  { value: "cpl", label: "CPL", description: "Cost Per Lead" },
  { value: "revshare", label: "RevShare", description: "Revenue Share %" },
  { value: "hybrid", label: "Hybrid", description: "CPA + RevShare" },
  { value: "other", label: "Other", description: "Custom Model" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [geoSearch, setGeoSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    // Step 1
    trafficSource: "",
    targetGeo: "",
    vertical: "",
    payoutModel: "",
    payoutAmount: "",
    // Step 2
    apiToken: "",
    affiliateApiKey: "",
    partnerBaseline: "",
    expectedConversionRate: "",
  });

  const filteredGeos = geoOptions.filter(geo => 
    geo.label.toLowerCase().includes(geoSearch.toLowerCase())
  );

  const selectedSource = trafficSources.find(s => s.value === formData.trafficSource);

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await submitOnboarding(formData);
      if (result.success) {
        router.push("/campaigns");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Ошибка сохранения. Попробуйте снова.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-8">
          <Link href="/campaigns" className="font-bold text-xl flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">⚡</div>
            Campaign Analytics
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <span className="text-slate-500 font-medium">Настройка</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/campaigns" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Кабинет
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            {/* Step 1 Indicator */}
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all ${
              step === 1 
                ? "bg-amber-100 border border-amber-300" 
                : "bg-white border border-slate-200 shadow-sm"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 1 
                  ? "bg-amber-500 text-white" 
                  : step > 1 
                    ? "bg-green-500 text-white" 
                    : "bg-slate-200 text-slate-500"
              }`}>
                {step > 1 ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              </div>
              <span className={`font-medium ${step === 1 ? "text-amber-700" : "text-slate-500"}`}>
                Настройка
              </span>
            </div>

            {/* Connector */}
            <div className={`w-16 h-0.5 ${step > 1 ? "bg-amber-500" : "bg-slate-300"}`} />

            {/* Step 2 Indicator */}
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all ${
              step === 2 
                ? "bg-amber-100 border border-amber-300" 
                : "bg-white border border-slate-200 shadow-sm"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 2 
                  ? "bg-amber-500 text-white" 
                  : "bg-slate-200 text-slate-500"
              }`}>
                <Database className="w-4 h-4" />
              </div>
              <span className={`font-medium ${step === 2 ? "text-amber-700" : "text-slate-500"}`}>
                API и данные
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Workspace Setup */}
        {step === 1 && (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Настройка рабочего пространства
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Укажите параметры вашего проекта
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Traffic Source */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Globe className="w-4 h-4 text-amber-600" />
                  Источник трафика
                </label>
                <select
                  value={formData.trafficSource}
                  onChange={(e) => setFormData({ ...formData, trafficSource: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                >
                  <option value="">Выберите источник трафика</option>
                  {trafficSources.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target GEO with Search */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Target className="w-4 h-4 text-amber-600" />
                  Целевое ГЕО
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Поиск страны..."
                    value={geoSearch}
                    onChange={(e) => setGeoSearch(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all mb-2"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                    {filteredGeos.map((geo) => (
                      <button
                        key={geo.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, targetGeo: geo.value })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.targetGeo === geo.value
                            ? "bg-amber-500 text-white"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {geo.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vertical */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                  Вертикаль
                </label>
                <select
                  value={formData.vertical}
                  onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                >
                  <option value="">Выберите вертикаль</option>
                  {verticals.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payout Model */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Wallet className="w-4 h-4 text-amber-600" />
                  Модель оплаты
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {payoutModels.map((model) => (
                    <button
                      key={model.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, payoutModel: model.value })}
                      className={`p-4 rounded-xl text-center transition-all ${
                        formData.payoutModel === model.value
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <div className="font-bold text-lg">{model.label}</div>
                      <div className={`text-xs mt-1 ${formData.payoutModel === model.value ? "text-amber-100" : "text-slate-500"}`}>
                        {model.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout Amount */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Wallet className="w-4 h-4 text-amber-600" />
                  Сумма выплаты
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 font-bold">$</span>
                  <input
                    type="number"
                    placeholder="180"
                    value={formData.payoutAmount}
                    onChange={(e) => setFormData({ ...formData, payoutAmount: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-4">
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-6 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-amber-500/25 transition-all"
                >
                  Далее
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: API & Benchmarks */}
        {step === 2 && (
        <form onSubmit={handleSubmit}>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Подключение данных
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Подключите API и настройте бенчмарки
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* API Platform (Auto-filled) */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Globe className="w-4 h-4 text-amber-600" />
                  API Платформа
                </label>
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex items-center gap-2">
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">Авто</Badge>
                  {selectedSource?.api || "Выберите источник на шаге 1"}
                </div>
              </div>

              {/* API Access Token */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Key className="w-4 h-4 text-amber-600" />
                  API Access Token
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••"
                  value={formData.apiToken}
                  onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono"
                />
                <p className="text-xs text-slate-500">
                  Получите токен в настройках рекламного кабинета
                </p>
              </div>

              {/* Affiliate Network API Key */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Key className="w-4 h-4 text-amber-600" />
                  API Партнерской сети / ПП
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••"
                  value={formData.affiliateApiKey}
                  onChange={(e) => setFormData({ ...formData, affiliateApiKey: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono"
                />
                <p className="text-xs text-slate-500">
                  API ключ для получения данных о конверсиях
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 uppercase tracking-wider">Benchmarks</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Partner Baseline */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Target className="w-4 h-4 text-amber-600" />
                  Partner Baseline
                </label>
                <input
                  type="text"
                  placeholder="15 regs -> 1 deposit"
                  value={formData.partnerBaseline}
                  onChange={(e) => setFormData({ ...formData, partnerBaseline: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
                <p className="text-xs text-slate-500">
                  Ожидаемое соотношение конверсий от партнера
                </p>
              </div>

              {/* Expected Conversion Rate */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                  Expected Conversion Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="5"
                    value={formData.expectedConversionRate}
                    onChange={(e) => setFormData({ ...formData, expectedConversionRate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-600 font-bold">%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 py-6 bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-lg rounded-xl transition-all"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Назад
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-6 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Сохранение..." : "Сохранить и запустить"}
                  <Check className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
        )}

        {/* Help Text */}
        <p className="text-center text-slate-500 text-sm mt-8">
          Нужна помощь? <a href="#" className="text-amber-600 hover:text-amber-700 underline">Документация</a>
        </p>
      </main>
    </div>
  );
}
