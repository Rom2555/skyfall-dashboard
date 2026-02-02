"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface Campaign {
  id: number;
  name: string;
}

interface CampaignsDropdownProps {
  campaigns: Campaign[];
  count: number;
}

export function CampaignsDropdown({ campaigns, count }: CampaignsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCampaignClick = (id: number) => {
    setIsOpen(false);
    router.push(`/campaigns/${id}`);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
      >
        {count}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Активные кампании</p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => handleCampaignClick(campaign.id)}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                {campaign.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
