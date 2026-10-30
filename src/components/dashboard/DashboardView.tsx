import React from 'react';
import { WeeklyProgressCard } from './WeeklyProgressCard';
import { TodayProgressCard } from './TodayProgressCard';
import { WeeklyOverviewBar } from './WeeklyOverviewBar';
import { QuickActions } from './QuickActions';
import { ProductivitySummary } from './ProductivitySummary';
import { RecentSessionsList } from './RecentSessionsList';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Weekly Progress & Today's Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyProgressCard />
        </div>
        <div>
          <TodayProgressCard />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <QuickActions />

      {/* 7-Day Performance Bar */}
      <WeeklyOverviewBar />

      {/* Detailed Productivity Summary (6 key metrics) */}
      <ProductivitySummary />

      {/* Recent Sessions */}
      <RecentSessionsList />
    </div>
  );
};

