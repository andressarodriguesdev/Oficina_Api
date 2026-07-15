import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`card ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  accent?: 'orange' | 'steel' | 'green' | 'red';
}

const accentMap = {
  orange: 'bg-accent-500/10 text-accent-400',
  steel: 'bg-steel-500/10 text-steel-400',
  green: 'bg-emerald-500/10 text-emerald-400',
  red: 'bg-red-500/10 text-red-400',
};

export function StatCard({ title, value, icon, trend, trendUp, accent = 'orange' }: StatCardProps) {
  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-graphite-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-graphite-100 mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${accentMap[accent]}`}>{icon}</div>
      </div>
    </Card>
  );
}
