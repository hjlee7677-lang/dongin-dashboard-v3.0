/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Layers, Folder, Calendar } from "lucide-react";

interface DashboardStatsProps {
  totalProjects: number;
  totalFolders: number;
  recentAddedCount: number;
}

export default function DashboardStats({
  totalProjects,
  totalFolders,
  recentAddedCount,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8" id="dashboard-stats-grid">
      {/* Total Projects Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300" id="stat-card-projects">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs font-sans text-slate-500 font-medium uppercase tracking-wider mb-0.5">총 프로젝트</p>
            <h4 className="text-2xl font-semibold text-slate-800 tracking-tight">{totalProjects}</h4>
          </div>
        </div>
      </div>

      {/* Total Folders Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300" id="stat-card-folders">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Folder size={22} />
          </div>
          <div>
            <p className="text-xs font-sans text-slate-500 font-medium uppercase tracking-wider mb-0.5">총 폴더</p>
            <h4 className="text-2xl font-semibold text-slate-800 tracking-tight">{totalFolders}</h4>
          </div>
        </div>
      </div>

      {/* Recently Added Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300" id="stat-card-recent">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs font-sans text-slate-500 font-medium uppercase tracking-wider mb-0.5">최근 추가됨</p>
            <h4 className="text-2xl font-semibold text-slate-800 tracking-tight">{recentAddedCount}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
