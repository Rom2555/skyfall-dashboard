"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectFacebook } from "@/app/actions/facebook";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface ConnectFacebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectFacebookModal({ isOpen, onClose }: ConnectFacebookModalProps) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [accountId, setAccountId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccess(null);

    // Validate token
    if (!token.trim()) {
      setError("Access Token is required");
      return;
    }

    setIsLoading(true);

    try {
      // Call server action - accountId is optional
      const result = await connectFacebook(token.trim(), accountId.trim() || undefined);

      if (result.success) {
        setSuccess(`✅ Connected to ${result.accountName || "Facebook"} (${result.accountId})`);
        
        // Wait 1.5 seconds to show success message, then close and refresh
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1500);
      } else {
        setError(result.error || "Connection failed. Please try again.");
      }
    } catch (err) {
      console.error("Connection error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setToken("");
      setAccountId("");
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <Card className="relative z-10 w-full max-w-md mx-4 border-slate-200 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                f
              </div>
              Connect Facebook
            </CardTitle>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Access Token Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Access Token <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="EAAxxxxxxxxx..."
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm disabled:opacity-50 disabled:bg-slate-50"
              />
              <p className="text-xs text-slate-500">
                Get your token from{" "}
                <a
                  href="https://developers.facebook.com/tools/explorer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Graph API Explorer
                </a>
              </p>
            </div>

            {/* Ad Account ID Input (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Ad Account ID{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="act_123456789 or just 123456789"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm disabled:opacity-50 disabled:bg-slate-50"
              />
              <p className="text-xs text-slate-500">
                Leave empty to auto-detect your first active ad account
              </p>
            </div>

            {/* Permissions Info */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Required permissions:</strong> ads_read, ads_management, business_management
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !token.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                "Connect Facebook"
              )}
            </Button>

            {/* Cancel Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full"
            >
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConnectFacebookModal;
