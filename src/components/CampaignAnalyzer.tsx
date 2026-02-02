"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, CheckCircle, XCircle, Brain } from "lucide-react";

interface AIResult {
  technicalAnalysis: string;
  recommendation: string;
  action: "SCALE" | "PAUSE" | "MONITOR" | "OPTIMIZE";
  riskScore: number;
  confidence: number;
  analyzedAt: string;
}

interface AnalyzeResponse {
  success: boolean;
  campaignId?: number;
  triggerRunId?: string;
  status?: string;
  aiResult?: AIResult;
  error?: string;
}

export function CampaignAnalyzer() {
  const [isLoading, setIsLoading] = useState(false);
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle");
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state for custom input
  const [formData, setFormData] = useState({
    campaignName: "Test Campaign Alpha",
    spend: "500",
    clicks: "1200",
    impressions: "50000",
    conversions: "25",
    revenue: "800",
  });

  // 1. Function to start analysis (Button "Analyze")
  const startAnalysis = async () => {
    setIsLoading(true);
    setStatus("processing");
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/campaigns/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: formData.campaignName,
          spend: parseFloat(formData.spend) || 0,
          clicks: parseInt(formData.clicks) || 0,
          impressions: parseInt(formData.impressions) || 0,
          conversions: parseInt(formData.conversions) || 0,
          revenue: parseFloat(formData.revenue) || 0,
        }),
      });

      const data: AnalyzeResponse = await res.json();
      
      if (data.success && data.campaignId) {
        setCampaignId(data.campaignId);
        console.log("✅ Task started, Campaign ID:", data.campaignId, "Trigger Run:", data.triggerRunId);
      } else {
        setError(data.error || "Failed to start analysis");
        setStatus("failed");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("❌ Error starting analysis:", err);
      setError(err instanceof Error ? err.message : "Network error");
      setStatus("failed");
      setIsLoading(false);
    }
  };

  // 2. Polling effect to check status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max (60 * 2s)

    if (campaignId && status === "processing") {
      interval = setInterval(async () => {
        attempts++;
        
        if (attempts > maxAttempts) {
          console.log("⏰ Polling timeout");
          setStatus("failed");
          setError("Analysis timeout - please try again");
          setIsLoading(false);
          clearInterval(interval);
          return;
        }

        try {
          const res = await fetch(`/api/campaigns/analyze?id=${campaignId}`);
          const data: AnalyzeResponse = await res.json();

          console.log(`🔄 Checking status (attempt ${attempts}):`, data.status);

          if (data.status === "completed") {
            setStatus("completed");
            setResult(data.aiResult || null);
            setIsLoading(false);
            clearInterval(interval);
          } else if (data.status === "failed") {
            setStatus("failed");
            setError("AI analysis failed");
            setIsLoading(false);
            clearInterval(interval);
          }
          // If still processing, interval will fire again in 2 sec
        } catch (e) {
          console.error("❌ Polling error:", e);
        }
      }, 2000); // Check every 2 seconds
    }

    return () => clearInterval(interval);
  }, [campaignId, status]);

  // Action badge colors
  const getActionStyle = (action: string) => {
    switch (action) {
      case "SCALE":
        return "bg-green-100 text-green-800 border-green-300";
      case "PAUSE":
        return "bg-red-100 text-red-800 border-red-300";
      case "OPTIMIZE":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "MONITOR":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl">AI Campaign Analyzer</CardTitle>
            <p className="text-sm text-slate-500">Test the Trigger.dev AI analysis pipeline</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium text-slate-700">Campaign Name</label>
            <input
              type="text"
              value={formData.campaignName}
              onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Spend ($)</label>
            <input
              type="number"
              value={formData.spend}
              onChange={(e) => setFormData({ ...formData, spend: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Revenue ($)</label>
            <input
              type="number"
              value={formData.revenue}
              onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Clicks</label>
            <input
              type="number"
              value={formData.clicks}
              onChange={(e) => setFormData({ ...formData, clicks: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Impressions</label>
            <input
              type="number"
              value={formData.impressions}
              onChange={(e) => setFormData({ ...formData, impressions: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Conversions</label>
            <input
              type="number"
              value={formData.conversions}
              onChange={(e) => setFormData({ ...formData, conversions: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={startAnalysis}
          disabled={isLoading}
          className="w-full py-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI анализирует данные...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Запустить AI Анализ
            </>
          )}
        </Button>

        {/* Status Display */}
        {status === "processing" && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
            <div>
              <p className="font-medium text-yellow-800">Обработка...</p>
              <p className="text-sm text-yellow-600">
                Campaign ID: {campaignId} • Google Vertex + Azure GPT-4 анализируют
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {status === "failed" && error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Ошибка анализа</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Result Display */}
        {status === "completed" && result && (
          <div className="space-y-4">
            {/* Success Header */}
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Анализ завершен!</p>
                <p className="text-sm text-green-600">Campaign ID: {campaignId}</p>
              </div>
            </div>

            {/* AI Decision Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Вердикт AI</h3>
                <Badge className={`text-sm px-3 py-1 ${getActionStyle(result.action)}`}>
                  {result.action}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Risk Score</p>
                  <p className="text-2xl font-bold text-slate-900">{result.riskScore}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Confidence</p>
                  <p className="text-2xl font-bold text-slate-900">{(result.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Рекомендация</p>
                <p className="text-slate-700">{result.recommendation}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Технический анализ</p>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{result.technicalAnalysis}</p>
              </div>

              {/* Raw JSON (collapsible) */}
              <details className="mt-4">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                  Показать RAW JSON
                </summary>
                <pre className="mt-2 text-xs bg-slate-100 p-3 rounded overflow-auto max-h-48">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
